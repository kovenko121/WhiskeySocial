import { Text, Title, VerticalWhiskeyCard } from '@components';
import { useGetUser, useHadPouredThisWhiskey } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, UserType, Whiskey,
  Routes
} from '@types';
import { Empty, EmptyPostList, HorizontalFlatList, Row } from './styles';

export const UserTrendWhiskeys = ({ userId }: { userId: string }) => {
  const navigation = useNavigation<NavigationProps>();
  const { data: user } = useGetUser(userId);
  const { checkIfUserPoured } = useHadPouredThisWhiskey();

  const goToWhiskey = async (id: string) => {
    navigation.navigate(Routes.WhiskeyInfo, { id });
  };

  return (
    user?.userType === UserType.VENUE &&
    user.trendingWhiskeys &&
    user.trendingWhiskeys.items.length > 0 && (
      <>
        <Row>
          <Title size={18} mh={24}>
            Trending
          </Title>
        </Row>
        <HorizontalFlatList
          data={user.trendingWhiskeys.items
            .flatMap(({ whiskey, createdAt }) => ({
              ...whiskey,
              createdAt,
            }))
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={({ id }: { id: string }, index: number) => id + index}
          renderItem={({ item }: { item: Whiskey }) => (
            <VerticalWhiskeyCard
              whiskey={item}
              onPress={({ id }) => goToWhiskey(id)}
              pour={checkIfUserPoured(item.id)}
            />
          )}
          ListFooterComponent={<Empty />}
          ListEmptyComponent={
            <EmptyPostList>
              <Text size={14} mv={20} color="grey300" align="center">
                You don't have {'\n'} trending whiskeys yet
              </Text>
            </EmptyPostList>
          }
        />
      </>
    )
  );
};
