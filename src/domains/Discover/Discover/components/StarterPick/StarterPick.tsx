import { Text, Title, VerticalWhiskeyCard } from '@components';
import { useGetUser, useHadPouredThisWhiskey, useStarterPick } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import { UserType, Whiskey,
  Routes
} from '@types';
import {
  Empty,
  EmptyMessageContainer,
  FlatList,
  TitleContainer,
} from './styles';

export const StarterPick = () => {
  const { data: userData, isLoading: isLoadingUser } = useGetUser();
  const {
    data: whiskeyPages,
    isLoading: isLoadingWhiskeys,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStarterPick();
  const { checkIfUserPoured } = useHadPouredThisWhiskey();
  const navigation = useNavigation();

  const goToWhiskey = async (id: string) => {
    navigation.navigate(Routes.WhiskeyInfo, { id });
  };

  const starterPicks =
    whiskeyPages?.pages.flatMap((page) => page.items) ?? [];

  const isReady = !isLoadingUser && !isLoadingWhiskeys;

  return (
    isReady && (
      <>
        <TitleContainer>
          <Title size={18} align="left">
            New Bottles
          </Title>
        </TitleContainer>

        {starterPicks.length > 0 ? (
          <FlatList
            data={starterPicks}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={({ id }: { id: string }, index: number) => id + index}
            renderItem={({ item }: { item: Whiskey }) => (
              <VerticalWhiskeyCard
                mv={0}
                whiskey={item}
                userPicture={
                  userData?.userType === UserType.PERSON
                    ? userData.profilePictureLoaded
                    : undefined
                }
                onPress={({ id }) => goToWhiskey(id)}
                pour={checkIfUserPoured(item.id)}
              />
            )}
            ListFooterComponent={
              <>
                {isFetchingNextPage && <ActivityIndicator />}
                <Empty />
              </>
            }
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            windowSize={5}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            removeClippedSubviews
          />
        ) : (
          <EmptyMessageContainer>
            <Text>There are no new bottles yet!</Text>
          </EmptyMessageContainer>
        )}
      </>
    )
  );
};
