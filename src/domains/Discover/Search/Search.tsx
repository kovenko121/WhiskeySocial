import { Icon, Input, KeyboardAvoidingContainer, Link } from '@components';
import { useAuth } from '@contexts';
import { pickBottlePhoto } from '@helpers';
import { useDebounce, useFeatureFlags, useGetArticlesTags } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from '@types';
import type { RootStackParams
} from '@types';
import { useState } from 'react';
import { Keyboard } from 'react-native';
import BrandsList from './components/BrandsList';
import ClubsList from './components/ClubsList';
import PeoplesList from './components/PeoplesList';
import PlacesList from './components/PlacesList';
import WhiskeysList from './components/WhiskeysList';
import {
  ContentContainer,
  IconButton,
  InputContainer,
  ScanRow,
  ScreenContainer,
  ScreenPadding,
  SearchContainer,
  SearchTypeBar,
  SearchTypeButton,
  SearchTypeText,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'Search'>;

export enum Categories {
  WHISKEYS = 'Whiskeys',
  PEOPLES = 'People',
  CLUBS = 'Clubs',
  PLACES = 'Places',
  BRANDS = 'Brands',
}

const GUEST_CATEGORIES = [Categories.PEOPLES, Categories.PLACES];

export const SearchScreen = ({ navigation, route }: Props) => {
  const { user, isGuest } = useAuth();
  const sub = user?.sub;
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 100);
  const [myWhiskeysTags, setMyWhiskeysTags] = useState([]);
  const { data: featureFlags } = useFeatureFlags();

  useGetArticlesTags();

  const visibleCategories = isGuest
    ? Object.values(Categories).filter((c) => GUEST_CATEGORIES.includes(c))
    : Object.values(Categories);

  const [searchCategory, setSearchCategory] = useState(
    route?.params?.category || (isGuest ? Categories.PEOPLES : Categories.WHISKEYS)
  );

  const handleCancelSearch = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(Routes.Discover);
    }
  };

  const goToWhiskeyScreen = async ({ id }: any) => {
    navigation.navigate(Routes.WhiskeyInfo, { id });
  };

  const handleSearchInput = (text: string) => {
    if (text.charAt(0) === '@') {
      setSearchCategory(Categories.PEOPLES);
    }

    setSearch(text);
  };

  const handleSearchCloseIcon = () => {
    setSearch('');
    setMyWhiskeysTags([]);

    Keyboard.dismiss();
  };

  const goSuggestWhiskeyScreen = () => {
    navigation.navigate(Routes.SuggestWhiskey);
  };

  const goScanBottleScreen = async () => {
    const picture = await pickBottlePhoto();

    if (picture) {
      navigation.navigate(Routes.ScanBottle, {
        imageUri: picture.uri,
        intent: 'view',
      });
    }
  };

  const getPlaceholder = () => {
    if (searchCategory === Categories.WHISKEYS) {
      return 'Search by name, brand, etc';
    }
    if (searchCategory === Categories.PEOPLES) {
      return 'Search by name or username';
    }
    if (searchCategory === Categories.PLACES) {
      return 'Search by name';
    }
    if (searchCategory === Categories.BRANDS) {
      return 'Search by brand name';
    }
    if (searchCategory === Categories.CLUBS) {
      return 'Search by club name';
    }
    return '';
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingContainer>
        {/* TODO This whole component needs to be refactored, the styling is a absolute mess. It works but it's damp and smelly and I hate it */}
        <ScreenPadding>
          <ContentContainer>
            <SearchContainer>
              <IconButton onPress={handleCancelSearch}>
                <Icon name="left" size={16} color="primary500" />
              </IconButton>
              <InputContainer>
                <Input
                  icon="search"
                  iconSize={22}
                  placeholder={getPlaceholder()}
                  value={search}
                  onChangeText={handleSearchInput}
                  iconRight="close"
                  onPressIcon={handleSearchCloseIcon}
                  startedWithFocus
                  maxLength={50}
                  round
                />
              </InputContainer>
            </SearchContainer>

            <SearchTypeBar>
              {visibleCategories.map((category) => (
                <SearchTypeButton
                  key={category}
                  selected={searchCategory === category}
                  onPress={() => setSearchCategory(category)}
                >
                  <SearchTypeText>{category}</SearchTypeText>
                </SearchTypeButton>
              ))}
            </SearchTypeBar>

            {!isGuest &&
              searchCategory === Categories.WHISKEYS &&
              !!featureFlags?.whiskey_bottle_scan && (
                <ScanRow>
                  <Icon name="camera" size={18} color="primary" />
                  <Link color="primary" onPress={goScanBottleScreen}>
                    Scan bottle
                  </Link>
                </ScanRow>
              )}

            {!isGuest && (
              <WhiskeysList
                search={debouncedSearch}
                show={searchCategory === Categories.WHISKEYS}
                onItemPress={goToWhiskeyScreen}
                myWhiskeysTags={myWhiskeysTags}
                setMyWhiskeysTags={setMyWhiskeysTags}
                goSuggestWhiskeyScreen={goSuggestWhiskeyScreen}
              />
            )}

            <PeoplesList
              search={debouncedSearch}
              show={searchCategory === Categories.PEOPLES}
              sub={sub}
              navigation={navigation}
            />

            {!isGuest && (
              <BrandsList
                search={debouncedSearch}
                show={searchCategory === Categories.BRANDS}
                sub={sub}
                navigation={navigation}
              />
            )}

            <PlacesList
              search={debouncedSearch}
              show={searchCategory === Categories.PLACES}
              sub={sub}
              navigation={navigation}
            />

            {!isGuest && (
              <ClubsList
                search={debouncedSearch}
                show={searchCategory === Categories.CLUBS}
                navigation={navigation}
              />
            )}
          </ContentContainer>
        </ScreenPadding>
      </KeyboardAvoidingContainer>
    </ScreenContainer>
  );
};
