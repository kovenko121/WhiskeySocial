import { AbsoluteHeader, Button, Icon, useAdminQRCode } from '@components';
import { createShareLink, getDefaultClubImage } from '@helpers';
import { useClub, useClubMembershipPolling, useIsAppAdmin } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClubRole, MemberStatus,
  Routes
} from '@types';
import type { RootStackParams } from '@types';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Share,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { createLogger } from '../../../services/logger';
import { ClubJoinButton } from '../components/ClubJoinButton/ClubJoinButton';
import { ClubPostsFeed } from '../components/ClubPostsFeed/ClubPostsFeed';
import { ClubWhiskeySection } from '../components/ClubWhiskeySection';
import {
  AdminButtonsRow,
  AdminButtonWrapper,
  ChevronWrapper,
  ClubDetailsText,
  ClubNameText,
  ContentContainer,
  CoverPhoto,
  CoverPhotoContainer,
  CoverPhotoPlaceholder,
  ErrorContainer,
  ErrorText,
  LoadingContainer,
  PrivacyBadge,
  PrivacyRow,
  ProfilePicture,
  ProfilePictureContainer,
  ScreenContainer,
  StatsBar,
  StatsDivider,
  StatsLabel,
  StatsLabelRow,
  StatsValue,
  TappableStatsColumn,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'ClubProfile'>;

const logger = createLogger('ClubProfile');

export const ClubProfileScreen = ({ navigation, route }: Props) => {
  const { clubId } = route.params;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: club,
    isLoading,
    error,
    refetch: refetchClub,
  } = useClub(clubId);

  // Polling for real-time blocking detection
  const {
    membership,
    wasBlocked,
    refetch: refetchMembership,
  } = useClubMembershipPolling(clubId);

  // Handle blocking - navigate away when user gets blocked
  useEffect(() => {
    if (wasBlocked) {
      Alert.alert(
        'Removed from Club',
        'You are no longer a member of this club.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
    // Runs only when the blocked state flips; navigation is stable for the screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wasBlocked]);

  // Check if user can see stats (public club OR active member of private club)
  const canViewStats =
    !club?.isPrivate || membership?.status === MemberStatus.ACTIVE;

  // Check if user is an active member
  const isMember = membership?.status === MemberStatus.ACTIVE;

  // Check if user is admin
  const isAdmin =
    membership?.status === MemberStatus.ACTIVE &&
    (membership?.role === ClubRole.CLUBADMINROLE ||
      membership?.role === ClubRole.CLUBOWNERROLE);

  const isAppAdmin = useIsAppAdmin();
  const { showQRCode, QRModal } = useAdminQRCode({
    type: 'club',
    id: clubId,
    title: club?.clubName ?? 'Club QR Code',
  });

  const handleShare = async () => {
    const url = createShareLink({
      type: 'club',
      id: club!.id,
    });
    Share.share({
      message: `Look at ${club!.clubName} on Whiskey Social\n${url}`,
    });
  };

  const handleMemberCountPress = () => {
    if (canViewStats) {
      navigation.navigate(Routes.ClubMembers, { clubId });
    }
  };

  const handleWhiskeyCountPress = () => {
    if (canViewStats && club) {
      navigation.navigate(Routes.ClubWhiskeyList, {
        clubId,
        clubName: club.clubName,
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refetch main queries using their refetch functions
      await Promise.all([refetchClub(), refetchMembership()]);

      // Invalidate child component queries (they will refetch automatically)
      await queryClient.invalidateQueries({
        queryKey: ['club-whiskeys', clubId],
      });
      await queryClient.invalidateQueries({ queryKey: ['club-posts', clubId] });
    } catch (err) {
      logger.error('Failed to refresh club data:', err as Error);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <AbsoluteHeader />
        <LoadingContainer>
          <ActivityIndicator size="large" color="#fff" />
        </LoadingContainer>
      </ScreenContainer>
    );
  }

  if (error || !club) {
    return (
      <ScreenContainer>
        <AbsoluteHeader />
        <ErrorContainer>
          <Icon name="sad" size={48} color="danger500" />
          <ErrorText>
            {error
              ? 'Unable to load club. Check your connection.'
              : "This club doesn't exist or has been removed."}
          </ErrorText>
        </ErrorContainer>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AbsoluteHeader
        actionIcon="share"
        action={handleShare}
        secondaryActionIcon={isAppAdmin ? 'qr-code' : undefined}
        secondaryAction={isAppAdmin ? showQRCode : undefined}
      />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#fff"
            />
          }
        >
          {/* Cover Photo */}
          <CoverPhotoContainer>
            {club.coverPhoto ? (
              <CoverPhoto
                source={{ uri: club.coverPhoto }}
                resizeMode="cover"
              />
            ) : (
              <CoverPhotoPlaceholder>
                <Icon name="picture" size={48} color="grey300" />
              </CoverPhotoPlaceholder>
            )}
          </CoverPhotoContainer>

          {/* Profile Picture */}
          <ProfilePictureContainer>
            <ProfilePicture
              source={club.profilePicture ? { uri: club.profilePicture } : getDefaultClubImage()}
              resizeMode="cover"
            />
          </ProfilePictureContainer>

          {/* Club Info */}
          <ContentContainer>
            <PrivacyRow>
              <ClubNameText>{club.clubName}</ClubNameText>
              {club.isPrivate && (
                <PrivacyBadge>
                  <Icon name="lock" size={16} color="white" />
                </PrivacyBadge>
              )}
            </PrivacyRow>

            {club.clubDetails && (
              <ClubDetailsText>{club.clubDetails}</ClubDetailsText>
            )}

            {/* Admin: Edit + Manage Users buttons */}
            {isAdmin && (
              <AdminButtonsRow>
                <AdminButtonWrapper>
                  <Button
                    label="Edit"
                    icon="edit"
                    variant="outlineDefault"
                    onPress={() =>
                      navigation.navigate(Routes.EditClub, { clubId: club.id })
                    }
                    full
                  />
                </AdminButtonWrapper>
                <AdminButtonWrapper>
                  <Button
                    label="Manage Users"
                    icon="user"
                    variant="outlineDefault"
                    onPress={() =>
                      navigation.navigate(Routes.ManageClubUsers, {
                        clubId: club.id,
                      })
                    }
                    full
                  />
                </AdminButtonWrapper>
              </AdminButtonsRow>
            )}

            {/* Non-admin: Join/Request to Join/Member Button */}
            {!isAdmin && (
              <ClubJoinButton
                clubId={club.id}
                clubName={club.clubName}
                isPrivate={club.isPrivate}
              />
            )}

            {/* Stats Bar */}
            <StatsBar>
              {/* Tappable member count - navigates to Members List */}
              <TappableStatsColumn
                onPress={handleMemberCountPress}
                disabled={!canViewStats}
              >
                <StatsValue>
                  {canViewStats ? club.memberCount || 0 : '—'}
                </StatsValue>
                <StatsLabelRow>
                  <StatsLabel tappable={canViewStats}>Members</StatsLabel>
                  {canViewStats && (
                    <ChevronWrapper>
                      <Icon name="right" size={12} color="primary500" />
                    </ChevronWrapper>
                  )}
                </StatsLabelRow>
              </TappableStatsColumn>
              <StatsDivider />
              <TappableStatsColumn
                onPress={handleWhiskeyCountPress}
                disabled={!canViewStats}
              >
                <StatsValue>
                  {canViewStats ? club.whiskeyCount || 0 : '—'}
                </StatsValue>
                <StatsLabelRow>
                  <StatsLabel tappable={canViewStats}>Whiskeys</StatsLabel>
                  {canViewStats && (
                    <ChevronWrapper>
                      <Icon name="right" size={12} color="primary500" />
                    </ChevronWrapper>
                  )}
                </StatsLabelRow>
              </TappableStatsColumn>
            </StatsBar>
          </ContentContainer>

          {/* Club Whiskeys Section - outside ContentContainer to extend to screen edges */}
          <ClubWhiskeySection
            clubId={club.id}
            clubName={club.clubName}
            isAdmin={isAdmin}
            canViewWhiskeys={canViewStats}
          />

          {/* Club Posts Feed Section */}
          <ClubPostsFeed
            clubId={club.id}
            isPrivate={club.isPrivate}
            pinnedPostId={club.pinnedPostId}
            isAdmin={isAdmin}
            canViewPosts={canViewStats}
            isMember={isMember}
          />
        </ScrollView>
      </SafeAreaView>
      <QRModal />
    </ScreenContainer>
  );
};
