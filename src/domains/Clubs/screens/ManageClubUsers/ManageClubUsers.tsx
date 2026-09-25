import { Header, Icon, Text } from '@components';
import { useAuth } from '@contexts';
import { isUnauthorizedClubActionError } from '@helpers';
import {
  useListClubMembers,
  useListPendingMembers,
  useListBlockedMembers,
  useAcceptMember,
  useRejectMember,
  useRemoveMember,
  useBlockMember,
  useUnblockMember,
  usePromoteMember,
  useDemoteMember,
} from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClubMember, ClubRole, RootStackParams } from '@types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { theme } from '@theme';
import { ActiveMemberCard } from '../../components/ActiveMemberCard/ActiveMemberCard';
import { MemberActionMenu } from '../../components/MemberActionMenu/MemberActionMenu';
import { PendingMemberMenu } from '../../components/PendingMemberMenu/PendingMemberMenu';
import { BlockedMemberMenu } from '../../components/BlockedMemberMenu/BlockedMemberMenu';
import {
  ActiveIndicator,
  Badge,
  BadgeText,
  ContentContainer,
  EmptyContainer,
  EmptyText,
  FooterLoaderContainer,
  LoadingContainer,
  MembersList,
  ScreenContainer,
  SearchContainer,
  SearchInput,
  TabContainer,
  TabText,
  TabsContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'ManageClubUsers'>;

export const ManageClubUsersScreen = ({ route }: Props) => {
  const { clubId } = route.params;
  const {
    user: { sub },
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'members' | 'pending' | 'blocked'>('members');
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search query when switching tabs
  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  // Fetch members data
  const {
    data: membersData,
    isLoading: membersLoading,
    hasNextPage: membersHasMore,
    fetchNextPage: membersFetchMore,
    isFetchingNextPage: membersLoadingMore,
  } = useListClubMembers(clubId);

  const {
    data: pendingMembers,
    isLoading: pendingLoading,
  } = useListPendingMembers(clubId);

  const {
    data: blockedMembers,
    isLoading: blockedLoading,
  } = useListBlockedMembers(clubId);

  // Mutations
  const acceptMember = useAcceptMember();
  const rejectMember = useRejectMember();
  const removeMember = useRemoveMember();
  const blockMember = useBlockMember();
  const unblockMember = useUnblockMember();
  const promoteMember = usePromoteMember();
  const demoteMember = useDemoteMember();

  // Flatten paginated data (only for active members which uses infinite query)
  const allMembers = useMemo(() => {
    if (!membersData?.pages) return [];
    return membersData.pages.flatMap((page) => page.items);
  }, [membersData]);

  // Filter members based on search query
  const filterMembers = (members: ClubMember[]) => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter((member) =>
      !!(
        member.user?.username?.toLowerCase().includes(query) ||
        member.user?.personFirstName?.toLowerCase().includes(query) ||
        member.user?.personLastName?.toLowerCase().includes(query)
      )
    );
  };

  // filterMembers only closes over searchQuery, which is already a dependency.
  /* eslint-disable react-hooks/exhaustive-deps */
  const filteredAllMembers = useMemo(() => filterMembers(allMembers), [allMembers, searchQuery]);
  const filteredPendingMembers = useMemo(() => filterMembers(pendingMembers || []), [pendingMembers, searchQuery]);
  const filteredBlockedMembers = useMemo(() => filterMembers(blockedMembers || []), [blockedMembers, searchQuery]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Get current user's role
  const currentUserRole = useMemo(() => {
    const currentMember = allMembers.find((m) => m.userId === sub);
    return currentMember?.role;
  }, [allMembers, sub]);

  const isCurrentUserOwner = currentUserRole === ClubRole.CLUBOWNERROLE;

  // Handlers
  const handleLoadMore = useCallback(() => {
    // Only active members tab has pagination
    if (activeTab === 'members' && membersHasMore && !membersLoadingMore) {
      membersFetchMore();
    }
  }, [activeTab, membersHasMore, membersLoadingMore, membersFetchMore]);

  const handleMenuPress = (member: ClubMember) => {
    setSelectedMember(member);
    setIsMenuVisible(true);
  };

  const handleAccept = (member: ClubMember) => {
    acceptMember.mutate(
      { clubId, memberId: member.id },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Member approved successfully');
        },
        onError: (error: Error) => {
          const errorMessage = isUnauthorizedClubActionError(error)
            ? error.message
            : 'Failed to approve member';
          Alert.alert('Error', errorMessage);
        },
      }
    );
  };

  const handleReject = (member: ClubMember) => {
    Alert.alert(
      'Reject Request',
      `Reject @${member.user?.username}'s request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            rejectMember.mutate(
              { clubId, memberId: member.id },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Request rejected');
                },
                onError: (error: Error) => {
                  const errorMessage = isUnauthorizedClubActionError(error)
                    ? error.message
                    : 'Failed to reject request';
                  Alert.alert('Error', errorMessage);
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleBlockPending = (member: ClubMember) => {
    Alert.alert(
      'Block User',
      `Block @${member.user?.username} from joining? They will be permanently blocked from requesting to join this club.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            blockMember.mutate(
              {
                clubId,
                memberId: member.id,
              },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'User blocked');
                },
                onError: (error: Error) => {
                  const errorMessage = isUnauthorizedClubActionError(error)
                    ? error.message
                    : 'Failed to block user';
                  Alert.alert('Error', errorMessage);
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleRemove = (member: ClubMember) => {
    Alert.alert(
      'Remove Member',
      `Remove @${member.user?.username} from the club?\n\nTheir posts will remain in the club and they can rejoin later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeMember.mutate(
              { clubId, memberId: member.id },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Member removed from club');
                },
                onError: (error: Error) => {
                  const errorMessage = isUnauthorizedClubActionError(error)
                    ? error.message
                    : 'Failed to remove member';
                  Alert.alert('Error', errorMessage);
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleBlock = (member: ClubMember) => {
    Alert.alert(
      'Block Member',
      `Block @${member.user?.username}\n\nAll their posts will be permanently deleted and they cannot rejoin the club unless you unblock them.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            blockMember.mutate(
              {
                clubId,
                memberId: member.id,
              },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Member blocked and posts deleted');
                },
                onError: (error: Error) => {
                  const errorMessage = isUnauthorizedClubActionError(error)
                    ? error.message
                    : 'Failed to block member';
                  Alert.alert('Error', errorMessage);
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleUnblock = (member: ClubMember) => {
    Alert.alert(
      'Unblock User',
      `Unblock @${member.user?.username}? They will be moved to pending status and will need admin approval to rejoin.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: () => {
            unblockMember.mutate(
              { clubId, memberId: member.id },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'User unblocked and moved to pending');
                },
                onError: (error: Error) => {
                  const errorMessage = isUnauthorizedClubActionError(error)
                    ? error.message
                    : 'Failed to unblock user';
                  Alert.alert('Error', errorMessage);
                },
              }
            );
          },
        },
      ]
    );
  };

  const handlePromote = (member: ClubMember) => {
    Alert.alert(
      'Promote to Admin',
      `Promote @${member.user?.username} to admin? This will grant them admin privileges.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          onPress: () => {
            promoteMember.mutate(
              { clubId, memberId: member.id },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Member promoted to admin');
                },
                onError: (error: Error) => {
                  const errorMessage = isUnauthorizedClubActionError(error)
                    ? error.message
                    : 'Failed to promote member';
                  Alert.alert('Error', errorMessage);
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleDemote = (member: ClubMember) => {
    Alert.alert(
      'Remove Admin Privileges',
      `Are you sure you want to remove admin privileges from @${member.user?.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            demoteMember.mutate(
              { clubId, memberId: member.id },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Admin role removed');
                },
                onError: (error: Error) => {
                  const errorMessage = isUnauthorizedClubActionError(error)
                    ? error.message
                    : 'Failed to demote admin';
                  Alert.alert('Error', errorMessage);
                },
              }
            );
          },
        },
      ]
    );
  };

  const isLoading = membersLoading || pendingLoading || blockedLoading;

  // Memoized render functions for FlatList optimization
  const renderMemberItem = useCallback(
    ({ item }: { item: ClubMember }) => {
      const isTargetOwner = item.role === ClubRole.CLUBOWNERROLE;
      const isTargetAdmin = item.role === ClubRole.CLUBADMINROLE;
      const isCurrentUser = item.userId === sub;
      const isCurrentUserAdmin = currentUserRole === ClubRole.CLUBADMINROLE;

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
          member={item}
          onMenuPress={handleMenuPress}
          showMenu={shouldShowMenu}
        />
      );
    },
    [sub, currentUserRole, isCurrentUserOwner]
  );

  const renderPendingItem = useCallback(
    ({ item }: { item: ClubMember }) => (
      <ActiveMemberCard
        member={item}
        onMenuPress={handleMenuPress}
        showMenu
      />
    ),
    []
  );

  const renderBlockedItem = useCallback(
    ({ item }: { item: ClubMember }) => (
      <ActiveMemberCard
        member={item}
        onMenuPress={handleMenuPress}
        showMenu
      />
    ),
    []
  );

  if (isLoading) {
    return (
      <ScreenContainer>
        <Header title="Manage Users" />
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.white} />
        </LoadingContainer>
      </ScreenContainer>
    );
  }

  const renderContent = () => {
    if (activeTab === 'members') {
      return (
        <>
          <SearchContainer>
            <SearchInput
              placeholder="Search members..."
              placeholderTextColor={theme.colors.grey300}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search members"
              accessibilityHint="Type to filter members by username or name"
            />
          </SearchContainer>
          <MembersList
            data={filteredAllMembers}
            renderItem={renderMemberItem}
            keyExtractor={(item: ClubMember) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <EmptyContainer>
              <Icon name="user" size={48} color="grey300" />
              <EmptyText>No active members</EmptyText>
            </EmptyContainer>
          }
          ListFooterComponent={
            membersLoadingMore ? (
              <FooterLoaderContainer>
                <ActivityIndicator />
              </FooterLoaderContainer>
            ) : null
          }
          />
        </>
      );
    }

    if (activeTab === 'pending') {
      return (
        <>
          <SearchContainer>
            <SearchInput
              placeholder="Search pending requests..."
              placeholderTextColor={theme.colors.grey300}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search pending requests"
              accessibilityHint="Type to filter pending requests by username or name"
            />
          </SearchContainer>
          <MembersList
            data={filteredPendingMembers}
            renderItem={renderPendingItem}
            keyExtractor={(item: ClubMember) => item.id}
            ListEmptyComponent={
              <EmptyContainer>
                <Icon name="mail" size={48} color="grey300" />
                <EmptyText>No pending requests</EmptyText>
                <Text size={14} color="grey300" align="center" style={{ marginTop: 8 }}>
                  New join requests will appear here
                </Text>
              </EmptyContainer>
            }
          />
        </>
      );
    }

    if (activeTab === 'blocked') {
      return (
        <>
          <SearchContainer>
            <SearchInput
              placeholder="Search blocked users..."
              placeholderTextColor={theme.colors.grey300}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search blocked users"
              accessibilityHint="Type to filter blocked users by username or name"
            />
          </SearchContainer>
          <MembersList
            data={filteredBlockedMembers}
            renderItem={renderBlockedItem}
            keyExtractor={(item: ClubMember) => item.id}
            ListEmptyComponent={
              <EmptyContainer>
                <Icon name="lock" size={48} color="grey300" />
                <EmptyText>No blocked members</EmptyText>
                <Text size={14} color="grey300" align="center" style={{ marginTop: 8 }}>
                  Users you block will appear here
                </Text>
              </EmptyContainer>
            }
          />
        </>
      );
    }

    return null;
  };

  return (
    <ScreenContainer>
      <Header title="Manage Users" />
      <ContentContainer>
        <TabsContainer>
          <TabContainer onPress={() => setActiveTab('members')}>
            <TabText active={activeTab === 'members'}>Members</TabText>
            {activeTab === 'members' && <ActiveIndicator />}
          </TabContainer>

          <TabContainer onPress={() => setActiveTab('pending')}>
            <TabText active={activeTab === 'pending'}>Pending</TabText>
            {pendingMembers && pendingMembers.length > 0 && (
              <Badge>
                <BadgeText>{pendingMembers.length}</BadgeText>
              </Badge>
            )}
            {activeTab === 'pending' && <ActiveIndicator />}
          </TabContainer>

          <TabContainer onPress={() => setActiveTab('blocked')}>
            <TabText active={activeTab === 'blocked'}>Blocked</TabText>
            {activeTab === 'blocked' && <ActiveIndicator />}
          </TabContainer>
        </TabsContainer>

        {renderContent()}
      </ContentContainer>

      {activeTab === 'members' && (
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
      )}

      {activeTab === 'pending' && (
        <PendingMemberMenu
          visible={isMenuVisible}
          member={selectedMember}
          onClose={() => setIsMenuVisible(false)}
          onAccept={handleAccept}
          onReject={handleReject}
          onBlock={handleBlockPending}
        />
      )}

      {activeTab === 'blocked' && (
        <BlockedMemberMenu
          visible={isMenuVisible}
          member={selectedMember}
          onClose={() => setIsMenuVisible(false)}
          onUnblock={handleUnblock}
          onAcceptAsMember={handleAccept}
        />
      )}
    </ScreenContainer>
  );
};
