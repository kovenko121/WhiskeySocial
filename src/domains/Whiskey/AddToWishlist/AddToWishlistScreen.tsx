import { Header, Input, KeyboardAvoidingContainer } from '@components';
import { useDebounce } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from '@types';
import type { RootStackParams
} from '@types';
import { useState } from 'react';
import { Keyboard } from 'react-native';
import WishlistWhiskeysList from './WishlistSearchList';

import { ContentContainer, InputContainer, ScreenContainer } from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'AddWhiskeyToWishlist'>;

export const AddWhiskeyToWishlistScreen = ({ navigation }: Props) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 100);

  const handleSearchInput = (text: string) => {
    setSearch(text);
  };

  const handleSearchCloseIcon = () => {
    setSearch('');
    Keyboard.dismiss();
  };

  const goToWhiskeyScreen = async ({ id }: any) => {
    navigation.navigate(Routes.WhiskeyInfo, { id });
  };

  const goSuggestWhiskeyScreen = () => {
    navigation.navigate(Routes.SuggestWhiskey);
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingContainer>
        <>
          <Header title="Add to Wishlist" />
          <ContentContainer>
            <InputContainer>
              <Input
                icon="search"
                iconSize={22}
                placeholder="Search by name, brand, etc"
                value={search}
                onChangeText={handleSearchInput}
                iconRight="close"
                onPressIcon={handleSearchCloseIcon}
                startedWithFocus
                maxLength={50}
                round
              />
            </InputContainer>

            <WishlistWhiskeysList
              search={debouncedSearch}
              onItemPress={goToWhiskeyScreen}
              goSuggestWhiskeyScreen={goSuggestWhiskeyScreen}
            />
          </ContentContainer>
        </>
      </KeyboardAvoidingContainer>
    </ScreenContainer>
  );
};
