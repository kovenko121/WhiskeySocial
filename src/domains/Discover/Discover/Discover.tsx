import {
  Ad,
  BottomNavbar,
  CreatePostModal,
  Header,
  Icon,
  Text,
} from '@components';
import { useAuth } from '@contexts';
import { getTestId } from '@helpers';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdType, RootStackParams, User,
  Routes
} from '@types';
import { useRef, useState } from 'react';
import {
  ChoiceOfTheWeekCard,
  LatestArticles,
  NearbyPlaces,
  StarterPick,
  TastingEventCard,
  TopClubs,
} from './components';
import {
  AdContainer,
  Content,
  ContentContainer,
  ScreenContainer,
  ScrollContainer,
  SearchButton,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'Discover'>;

export const DiscoverScreen = ({ navigation }: Props) => {
  const { isGuest } = useAuth();

  const goToSearch = () => {
    // Guests can only browse People and Places, so land them on a category
    // they can actually see instead of the (hidden) Whiskeys tab.
    navigation.navigate(Routes.Search, {
      category: isGuest ? 'People' : 'Whiskeys',
    });
  };

  const discoverRef = useRef(null);

  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<User | undefined>(
    undefined
  );

  return (
    <ScreenContainer>
      <Header title="Discover" />
      <ScrollContainer ref={discoverRef} showsVerticalScrollIndicator={false}>
        <SearchButton onPress={goToSearch}>
          <Icon name="search" size={21} color="primary500" />
          <Text
            color="neutral300"
            size={14}
            mh={6}
            mv={6}
            testID={getTestId('search-whiskey-people-places')}
          >
            Search whiskey, people, places, etc.
          </Text>
        </SearchButton>
        <Content>
          <TastingEventCard />
          <NearbyPlaces
            setSelectedVenue={setSelectedVenue}
            setCreatePostVisible={setCreatePostVisible}
          />
          <StarterPick />
          <LatestArticles />
          <TopClubs />
          <AdContainer>
            <Ad type={AdType.DISCOVERY} />
          </AdContainer>
          <ContentContainer>
            <ChoiceOfTheWeekCard />
          </ContentContainer>
        </Content>
      </ScrollContainer>
      <CreatePostModal
        venueCheckin={selectedVenue}
        visible={createPostVisible}
        onBackButtonPress={() => setCreatePostVisible(false)}
      />
      <BottomNavbar
        active="search"
        onActivePress={() =>
          discoverRef &&
          discoverRef.current &&
          (discoverRef.current as any).scrollTo({ x: 0, y: 0, animated: true })
        }
      />
    </ScreenContainer>
  );
};
