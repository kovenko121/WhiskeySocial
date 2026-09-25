import { Button } from '@components';
import {
  useGetClubMembership,
  useJoinClub,
  useRequestToJoinClub,
  useLeaveClub,
  useCancelJoinRequest,
} from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { ClubRole, MemberStatus, NavigationProps,
  Routes
} from '@types';
import { Alert } from 'react-native';
import { ButtonContainer } from './styles';
import { createLogger } from '../../../../services/logger';

const logger = createLogger('ClubJoinButton');

interface ClubJoinButtonProps {
  clubId: string;
  clubName: string;
  isPrivate: boolean;
  noMargin?: boolean;
}

export const ClubJoinButton = ({
  clubId,
  clubName,
  isPrivate,
  noMargin = false,
}: ClubJoinButtonProps) => {
  const navigation = useNavigation<NavigationProps>();
  const { data: membership, isLoading: membershipLoading } =
    useGetClubMembership(clubId);
  const joinClub = useJoinClub();
  const requestToJoinClub = useRequestToJoinClub();
  const leaveClub = useLeaveClub();
  const cancelJoinRequest = useCancelJoinRequest();

  const handleJoinPublicClub = async () => {
    try {
      await joinClub.mutateAsync({ clubId });
      Alert.alert('Success', `You've joined ${clubName}!`, [{ text: 'OK' }]);
    } catch (error) {
      logger.error('Failed to join club:', error as Error);
      Alert.alert(
        'Join Failed',
        'Unable to join this club. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRequestToJoinPrivateClub = async () => {
    try {
      await requestToJoinClub.mutateAsync({ clubId });
      Alert.alert('Request Sent', `Request sent to ${clubName}`, [
        { text: 'OK' },
      ]);
    } catch (error) {
      logger.error('Failed to request to join club:', error as Error);
      Alert.alert(
        'Request Failed',
        'Unable to send request. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLeaveClub = () => {
    Alert.alert(
      `Leave ${clubName}?`,
      'Are you sure you want to leave this club?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveClub.mutateAsync({
                clubId,
                membershipId: membership!.id,
              });

              Alert.alert('Success', 'You have left the club', [{ text: 'OK' }]);
              navigation.navigate(Routes.Search, { category: 'Clubs' });
            } catch (error) {
              logger.error('Failed to leave club:', error as Error);
              Alert.alert(
                'Error',
                'Unable to leave this club. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleCancelRequest = () => {
    Alert.alert(
      'Cancel Request?',
      `Cancel your request to join ${clubName}?`,
      [
        { text: 'Keep Request', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelJoinRequest.mutateAsync({
                clubId,
                membershipId: membership!.id,
              });
              Alert.alert('Request Cancelled', 'Your request to join has been cancelled', [
                { text: 'OK' },
              ]);
            } catch (error) {
              logger.error('Failed to cancel request:', error as Error);
              Alert.alert(
                'Error',
                'Unable to cancel request. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  // Show loading state while checking membership
  if (membershipLoading) {
    return (
      <ButtonContainer noMargin={noMargin}>
        <Button label="" loading variant="default" full />
      </ButtonContainer>
    );
  }

  // If user is already an active member, show appropriate button based on role
  if (membership?.status === MemberStatus.ACTIVE) {
    const isOwner = membership.role === ClubRole.CLUBOWNERROLE;
    const isAdmin = membership.role === ClubRole.CLUBADMINROLE;

    // Owner cannot leave - show disabled "Owner" button
    if (isOwner) {
      return (
        <ButtonContainer noMargin={noMargin}>
          <Button
            label="Owner"
            icon="check"
            variant="outlineDefault"
            full
            disabled
          />
        </ButtonContainer>
      );
    }

    // Admin and regular members can leave
    return (
      <ButtonContainer noMargin={noMargin}>
        <Button
          label={isAdmin ? 'Admin' : 'Member'}
          icon="check"
          onPress={handleLeaveClub}
          loading={leaveClub.isPending}
          variant="outlineDefault"
          full
        />
      </ButtonContainer>
    );
  }

  // If user has a pending request, show tappable "Request Pending" button
  if (membership?.status === MemberStatus.PENDING) {
    return (
      <ButtonContainer noMargin={noMargin}>
        <Button
          label="Request Pending"
          onPress={handleCancelRequest}
          loading={cancelJoinRequest.isPending}
          variant="outlineDefault"
          full
        />
      </ButtonContainer>
    );
  }

  // If user is blocked, don't show button
  if (membership?.status === MemberStatus.BLOCKED) {
    return null;
  }

  // For public clubs, show "Join" button
  if (!isPrivate) {
    return (
      <ButtonContainer noMargin={noMargin}>
        <Button
          label="Join"
          onPress={handleJoinPublicClub}
          loading={joinClub.isPending}
          variant="default"
          full
        />
      </ButtonContainer>
    );
  }

  // For private clubs, show "Request to Join" button
  return (
    <ButtonContainer noMargin={noMargin}>
      <Button
        label="Request to Join"
        icon="lock"
        onPress={handleRequestToJoinPrivateClub}
        loading={requestToJoinClub.isPending}
        variant="outlineDefault"
        full
      />
    </ButtonContainer>
  );
};
