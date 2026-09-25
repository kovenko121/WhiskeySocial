import { Icon, Link, Text } from '@components';
import { useGetVenueRequest } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps,
  Routes
} from '@types';
import { useState } from 'react';
import { ClaimVenueContainer } from './styles';

export const ClaimVenue = ({
  venueName,
  userId,
}: {
  venueName: string;
  userId: string;
}) => {
  const navigation = useNavigation<NavigationProps>();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data } = useGetVenueRequest(userId);

  if (data) {
    const date = new Date(data.createdAt).toLocaleDateString();

    return (
      <ClaimVenueContainer>
        <Icon name="venue" size={20} color="primary" />
        <Text mv={8}>You claimed this venue on {date}</Text>
      </ClaimVenueContainer>
    );
  }

  if (showConfirmation) {
    return (
      <ClaimVenueContainer>
        <Icon name="alert-sign" size={20} color="primary" />
        <Text mv={8}>Do you want to claim this venue as yours?</Text>
        <Link
          onPress={() =>
            navigation.navigate(Routes.ClaimingVenue, { venueId: userId })
          }
          color="primary"
          bold
        >
          Yes, let me claim it!
        </Link>
        <Link
          mv={12}
          onPress={() => setShowConfirmation(false)}
          color="primary"
        >
          Forget it.
        </Link>
      </ClaimVenueContainer>
    );
  }

  return (
    <ClaimVenueContainer>
      <Icon name="venue" size={20} color="primary" />

      <Text mv={8}>{venueName} is not on WS® yet.</Text>
      <Link onPress={() => setShowConfirmation(true)} color="primary" bold>
        This is my venue.
      </Link>
    </ClaimVenueContainer>
  );
};
