import { HorizontalUserCard, Text } from '@components';
import { navigateUserProfile } from '@helpers';
import { useUsers } from '@hooks';
import { User, UserType } from '@types';
import { ActivityIndicator, FlatList } from 'react-native';
import { capturePostHogEvent } from '../../../../config/posthog';
import { Empty, ListContainer } from '../styles';

const BrandsList = ({
  search,
  show,
  sub,
  navigation,
}: {
  search: string;
  show: boolean;
  sub: string;
  navigation: any;
}) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUsers(search, UserType.BRAND);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (!show) {
    return null;
  }

  return (
    <ListContainer>
      {!isLoading && data && (
        (() => {
          const users = data.pages.flatMap((page) => page.items) as User[];
          return (
            <FlatList
              data={users}
              renderItem={({ item, index }) => (
                <HorizontalUserCard
                  user={item}
                  onPress={() => {
                    capturePostHogEvent('search_performed', {
                      query: search,
                      results_count: users.length,
                      result_tapped_index: index,
                      result_type: 'brand',
                    });
                    navigateUserProfile(item.id, sub, navigation);
                  }}
                />
              )}
              keyExtractor={(item) => item.id}
              onEndReached={handleLoadMore}
              ListEmptyComponent={
                <Text size={14} mv={20} mr={24} color="grey300" align="center">
                  No brands found
                </Text>
              }
              ListFooterComponent={
                <>
                  {isFetchingNextPage && <ActivityIndicator />}
                  <Empty />
                </>
              }
            />
          );
        })()
      )}
    </ListContainer>
  );
};

export default BrandsList;