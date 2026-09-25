import { useDebounce, useHadPouredThisWhiskey, useWhiskeys } from '@hooks';
import { Whiskey } from '@types';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { HorizontalWhiskeyCard } from '../../../../components/Card/HorizontalCard/HorizontalCard';
import { Input } from '../../../../components/Input/Input';
import { ModalBottom } from '../../../../components/ModalBottom/ModalBottom';
import { Link } from '../../../../components/Text/Text';
import {
  CenterContainer,
  ContentContainer,
  InputWrapper,
  Loading,
} from './styles';

const FindWhiskeyModalBottom = ({
  onBackButtonPress,
  onWhiskeySelected,
  visible,
}: {
  onBackButtonPress: () => void;
  onWhiskeySelected: (whiskey: Whiskey) => void;

  visible: boolean;
}) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWhiskeys(debouncedSearch);
  const { checkIfUserPoured } = useHadPouredThisWhiskey();

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <ModalBottom onBackButtonPress={onBackButtonPress} visible={visible}>
      <ContentContainer>
        <Link color="primary500" bold onPress={() => onBackButtonPress()}>
          Cancel
        </Link>
        <InputWrapper>
          <Input
            icon="search"
            iconSize={25}
            placeholder="Search by name, brand, proof, age"
            value={search}
            onChangeText={setSearch}
            maxLength={50}
            round
          />
        </InputWrapper>

        <CenterContainer>
          {isFetching && <Loading />}
          {!isLoading && data ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
              maxToRenderPerBatch={5}
              data={data.pages.flatMap((page) => page.items) as Whiskey[]}
              renderItem={({ item }) => (
                <HorizontalWhiskeyCard
                  shadow
                  whiskey={item}
                  onPress={() => onWhiskeySelected(item)}
                  mv={0}
                  pour={checkIfUserPoured(item.id)}
                />
              )}
              keyExtractor={(item) => item.id}
              onEndReached={handleLoadMore}
            />
          ) : (
            <FlatList
              data={[{}, {}]}
              renderItem={() => <HorizontalWhiskeyCard shadow />}
            />
          )}
        </CenterContainer>
      </ContentContainer>
    </ModalBottom>
  );
};

export { FindWhiskeyModalBottom };
