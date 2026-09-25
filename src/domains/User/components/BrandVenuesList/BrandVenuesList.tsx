import { useNavigation } from '@react-navigation/native';
import { NavigationProps, User,
  Routes
} from '@types';
import { Icon, Text, Title } from '@components';
import { BrandVenuesContainer, VenueLinkContainer, TitleContainer } from './styles';

interface BrandVenuesListProps {
  user: User;
}

export const BrandVenuesList = ({ user }: BrandVenuesListProps) => {
  const navigation = useNavigation<NavigationProps>();
  const venues = user?.brandVenues?.items || [];

  if (venues.length === 0) {
    return null;
  }

  const handleVenuePress = (venueId: string) => {
    navigation.navigate(Routes.UserProfile, { id: venueId });
  };

  return (
    <BrandVenuesContainer>
      <TitleContainer>
        <Title size={16}>
          {venues.length > 1 ? 'Visit the Tap Rooms' : 'Visit the Tap Room'}
        </Title>
      </TitleContainer>
      {venues.map((venue) => (
        venue && (
          <VenueLinkContainer 
            key={venue.id} 
            onPress={() => handleVenuePress(venue.id)}
            activeOpacity={0.7}
          >
            <Icon name="venue" size={20} color="primary" />
            <Text mh={12} color="primary" style={{fontWeight: "bold"}}>
              {venue.venueName || 'Tap Room'}
            </Text>
            <Icon name="right" size={16} color="primary" />
          </VenueLinkContainer>
        )
      ))}
    </BrandVenuesContainer>
  );
};
