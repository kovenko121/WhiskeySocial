import { Header, HorizontalUserCard, Link, Text } from '@components';
import { useAuth } from '@contexts';
import { navigateUserProfile } from '@helpers';
import { useUsersByIds } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams, User } from '@types';
import { useEffect, useState } from 'react';
import { useGetUser } from '../../../hooks/user/useGetUser';
import {
  ActiveIndicator,
  ContentContainer,
  FollowersFollowingList,
  ScreenContainer,
  TabContainer,
  TabsContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'FollowingFollowersList'>;

export const FollowingFollowersListScreen = ({ navigation, route }: Props) => {
  const {
    user: { sub },
  } = useAuth();

  const user = useGetUser(route.params.userId);

  const followers = useUsersByIds(user ? user.data?.followers : '');

  const handleLoadMoreFollowers = () => {
    if (followers.hasNextPage && !followers.isFetchingNextPage) {
      followers.fetchNextPage();
    }
  };

  const following = useUsersByIds(user ? user.data?.following : '');

  const handleLoadMoreFollowing = () => {
    if (following.hasNextPage && !following.isFetchingNextPage) {
      following.fetchNextPage();
    }
  };

  const [activeTab, setActiveTab] = useState<string>(route.params.openWith);

  const [flattedData, setFlattedData] = useState<any>([]);

  useEffect(() => {
    if (following.data && following.data.pages) {
      setFlattedData(
        following.data.pages.flatMap((page) => page.items) as User[]
      );
    }
  }, [following.data]);

  return (
    <ScreenContainer>
      <ContentContainer>
        <Header
          title={`@${route.params.username}`}
          navBack={() => navigation.goBack()}
          actionText=""
        />
        <TabsContainer>
          <TabContainer>
            <Link
              onPress={async () => setActiveTab('Followers')}
              color="white"
              bold
            >
              Followers
            </Link>
            {activeTab === 'Followers' && <ActiveIndicator />}
          </TabContainer>
          <TabContainer>
            <Link
              onPress={async () => {
                setActiveTab('Following');
              }}
              color="white"
              bold
            >
              Following
            </Link>
            {activeTab === 'Following' && <ActiveIndicator />}
          </TabContainer>
        </TabsContainer>
        {followers.data && activeTab === 'Followers' && (
          <FollowersFollowingList
            data={followers.data.pages.flatMap((page) => page.items) as User[]}
            renderItem={({ item }: { item: User }) => (
              <HorizontalUserCard
                user={item}
                onPress={() => navigateUserProfile(item?.id, sub, navigation)}
              />
            )}
            keyExtractor={(item: User) => item.id}
            onEndReached={handleLoadMoreFollowers}
            ListEmptyComponent={
              <Text size={14} mv={20} mr={24} color="grey300" align="center">
                No users found
              </Text>
            }
          />
        )}
        {activeTab === 'Following' && (
          <FollowersFollowingList
            data={flattedData}
            renderItem={({ item }: { item: User }) => (
              <HorizontalUserCard
                user={item}
                onPress={() => navigateUserProfile(item?.id, sub, navigation)}
                unfollowButton={sub === route.params.userId}
                followButton={sub !== route.params.userId}
              />
            )}
            keyExtractor={(item: User) => item.id}
            onEndReached={handleLoadMoreFollowing}
            ListEmptyComponent={
              <Text size={14} mv={20} mr={24} color="grey300" align="center">
                No users found
              </Text>
            }
          />
        )}
      </ContentContainer>
    </ScreenContainer>
  );
};
