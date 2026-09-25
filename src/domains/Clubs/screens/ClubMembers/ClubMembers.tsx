import { Header, HorizontalMemberCard, Icon } from '@components';
import { useAuth } from '@contexts';
import { navigateUserProfile } from '@helpers';
import {
  useBlockMember,
  useClub,
  useClubMembershipPolling,
  useDemoteMember,
  useListClubMembers,
  usePromoteMember,
  useRemoveMember,
} from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClubMember, ClubRole, MemberStatus, RootStackParams } from '@types';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { ActiveMemberCard } from '../../components/ActiveMemberCard/ActiveMemberCard';
import { MemberActionMenu } from '../../components/MemberActionMenu/MemberActionMenu';
import {
  ContentContainer,
  EmptyContainer,
  EmptyText,
  FooterLoaderContainer,
  LoadingContainer,
  LockScreenContainer,
  LockScreenText,
  MembersList,
  ScreenContainer,
  SectionHeader,
  SectionHeaderText,
} from './styles';

type SectionItem = {
  type: 'header' | 'member';
  data: string | ClubMember;
  id: string;
};

type Props = NativeStackScreenProps<RootStackParams, 'ClubMembers'>;

export const ClubMembersScreen = ({ navigation, route }: Props) => {
  const { clubId } = route.params;
  const {
    user: { sub },
  } = useAuth();
  const { data: club, isLoading: clubLoading } = useClub(clubId);

  // Polling for real-time blocking detection
  const { membership, wasBlocked } = useClubMembershipPolling(clubId);

  // Handle blocking - navigate away when user gets blocked
  useEffect(() => {
    if (wasBlocked) {
      Alert.alert(
        'Removed from Club',
        'You are no longer a member of this club.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [wasBlocked, navigation]);

  const {
    data: membersData,
    isLoading: membersLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useListClubMembers(clubId);

  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Mutations
  const removeMember = useRemoveMember();
  const blockMember = useBlockMember();
  const promoteMember = usePromoteMember();
  const demoteMember = useDemoteMember();

  // Check if user can view members list
  const canViewMembers =
    !club?.isPrivate || membership?.status === MemberStatus.ACTIVE;

  // Check if current user is admin
  const isAdmin =
    membership?.status === MemberStatus.ACTIVE &&
    (membership?.role === ClubRole.CLUBADMINROLE ||
      membership?.role === ClubRole.CLUBOWNERROLE);

  // Flatten paginated data
  const allMembers = useMemo(() => {
    if (!membersData?.pages) return [];
    return membersData.pages.flatMap((page) => page.items);
  }, [membersData]);

  // Separate admins and regular members
  const { admins, members } = useMemo(() => {
    const adminList: ClubMember[] = [];
    const memberList: ClubMember[] = [];

    allMembers.forEach((member) => {
      if (
        member.role === ClubRole.CLUBADMINROLE ||
        member.role === ClubRole.CLUBOWNERROLE
      ) {
        adminList.push(member);
      } else {
        memberList.push(member);
      }
    });

    return { admins: adminList, members: memberList };
  }, [allMembers]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleMemberPress = (member: ClubMember) => {
    if (member.user?.id) {
      navigateUserProfile(member.user.id, sub, navigation);
    }
  };

  const handleMenuPress = (member: ClubMember) => {
    setSelectedMember(member);
    setIsMenuVisible(true);
  };

  const handleRemove = (member: ClubMember) => {
    removeMember.mutate(
      { clubId, memberId: member.id },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Member removed from club');
        },
        onError: () => {
          Alert.alert('Error', 'Failed to remove member');
        },
      }
    );
  };

  const handleBlock = (member: ClubMember) => {
    blockMember.mutate(
      {
        clubId,
        memberId: member.id,
        userId: member.userId,
        currentStatus: MemberStatus.ACTIVE,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Member blocked and posts deleted');
        },
        onError: () => {
          Alert.alert('Error', 'Failed to block member');
        },
      }
    );
  };

  const handlePromote = (member: ClubMember) => {
    promoteMember.mutate(
      { clubId, memberId: member.id },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Member promoted to admin');
        },
        onError: () => {
          Alert.alert('Error', 'Failed to promote member');
        },
      }
    );
  };

  const handleDemote = (member: ClubMember) => {
    demoteMember.mutate(
      { clubId, memberId: member.id },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Admin role removed');
        },
        onError: () => {
          Alert.alert('Error', 'Failed to demote admin');
        },
      }
    );
  };

  // Build sections data for rendering
  const sectionsData = useMemo((): SectionItem[] => {
    const sections: SectionItem[] = [];

    if (admins.length > 0) {
      sections.push({ type: 'header', data: 'Admins', id: 'header-admins' });
      admins.forEach((admin) =>
        sections.push({ type: 'member', data: admin, id: `member-${admin.id}` })
      );
    }

    if (members.length > 0) {
      sections.push({ type: 'header', data: 'Members', id: 'header-members' });
      members.forEach((member) =>
        sections.push({
          type: 'member',
          data: member,
          id: `member-${member.id}`,
        })
      );
    }

    return sections;
  }, [admins, members]);

  if (clubLoading || membersLoading) {
    return (
      <ScreenContainer>
        <Header title="Members" />
        <LoadingContainer>
          <ActivityIndicator size="large" color="#fff" />
        </LoadingContainer>
      </ScreenContainer>
    );
  }

  // Private club - non-member/pending sees lock screen
  if (!canViewMembers) {
    return (
      <ScreenContainer>
        <Header title="Members" />
        <LockScreenContainer>
          <Icon name="lock" size={48} color="grey300" />
          <LockScreenText>Join to view members</LockScreenText>
        </LockScreenContainer>
      </ScreenContainer>
    );
  }

  const totalCount = club?.memberCount || allMembers.length;

  return (
    <ScreenContainer>
      <Header title={`Members (${totalCount})`} />
      <ContentContainer>
        <MembersList
          data={sectionsData}
          renderItem={({ item }: { item: SectionItem }) => {
            if (item.type === 'header') {
              return (
                <SectionHeader>
                  <SectionHeaderText>{item.data as string}</SectionHeaderText>
                </SectionHeader>
              );
            }
            const member = item.data as ClubMember;
            // Show ActiveMemberCard with menu for admins, HorizontalMemberCard for non-admins
            if (isAdmin) {
              const isTargetOwner = member.role === ClubRole.CLUBOWNERROLE;
              const isTargetAdmin = member.role === ClubRole.CLUBADMINROLE;
              const isCurrentUser = member.userId === sub;
              const isCurrentUserAdmin =
                membership?.role === ClubRole.CLUBADMINROLE;
              const isCurrentUserOwner =
                membership?.role === ClubRole.CLUBOWNERROLE;

              // Show menu if:
              // - Is current user who is an admin (can demote self or leave) - NOT owner since owners can't leave
              // - OR: Not current user AND not an owner AND (not admin OR current user is owner)
              const shouldShowMenu =
                (isCurrentUser && isCurrentUserAdmin) ||
                (!isCurrentUser &&
                  !isTargetOwner &&
                  (!isTargetAdmin || isCurrentUserOwner));

              return (
                <ActiveMemberCard
                  member={member}
                  onMenuPress={handleMenuPress}
                  showMenu={shouldShowMenu}
                />
              );
            }
            return (
              <HorizontalMemberCard
                member={member}
                onPress={() => handleMemberPress(member)}
              />
            );
          }}
          keyExtractor={(item: SectionItem) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <EmptyContainer>
              <Icon name="user" size={48} color="grey300" />
              <EmptyText>No members yet</EmptyText>
            </EmptyContainer>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <FooterLoaderContainer>
                <ActivityIndicator />
              </FooterLoaderContainer>
            ) : null
          }
        />
      </ContentContainer>

      <MemberActionMenu
        visible={isMenuVisible}
        member={selectedMember}
        currentUserId={sub}
        onClose={() => setIsMenuVisible(false)}
        onPromote={handlePromote}
        onDemote={handleDemote}
        onRemove={handleRemove}
        onBlock={handleBlock}
      />
    </ScreenContainer>
  );
};
