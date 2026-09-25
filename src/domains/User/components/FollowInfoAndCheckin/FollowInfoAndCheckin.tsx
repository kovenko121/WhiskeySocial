import { TouchableOpacity } from 'react-native';
import { Link, Skeleton, Text } from '@components';
import { formatNumber, getTestId } from '@helpers';
import { useSearchUserPours, useGetUserClubs } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, User, UserType,
  Routes
} from '@types';
import { StatusWrapper } from './styles';

const FollowInfoAndCheckin = ({
  user,
  checkins,
  goToFollowingFollowers,
}: {
  user?: User;
  checkins?: any;
  goToFollowingFollowers: (username: string, tab: string, id: string) => {};
}) => {
  const { data } = useSearchUserPours(user?.id);
  const navigation = useNavigation<NavigationProps>();
  const { data: userClubs } = useGetUserClubs({
    userId: user?.id ?? '',
    enabled: user?.userType === UserType.PERSON && !!user?.id,
  });

  const poursCount = data?.pages[0].items.length;
  const clubsCount = userClubs?.length ?? 0;

  return (
    <StatusWrapper ph={user?.userType === UserType.VENUE ? 24 : 0}>
      {user ? (
        <>
          {user?.userType === UserType.PERSON && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(Routes.PoursList, { userId: user?.id })
              }
              testID={getTestId('pours')}
              accessibilityRole="button"
              accessibilityLabel={`${formatNumber(poursCount ?? 0)} Pours`}
            >
              <Text color="white" bold size={12} align="center">
                {formatNumber(poursCount ?? 0)}
              </Text>
              <Link color="white" bold size={12} underlined>
                Pours
              </Link>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            testID={getTestId('followers')}
            onPress={() =>
              goToFollowingFollowers(user.username, 'Followers', user.id)
            }
            accessibilityRole="button"
            accessibilityLabel={`${formatNumber(user.followers?.length ?? 0)} ${user?.followers && user?.followers?.length === 1 ? 'Follower' : 'Followers'}`}
          >
            <Text color="white" bold size={12} align="center">
              {formatNumber(user.followers?.length ?? 0)}
            </Text>
            <Link color="white" bold size={12} underlined>
              {user?.followers && user?.followers?.length === 1
                ? 'Follower'
                : 'Followers'}
            </Link>
          </TouchableOpacity>
          {(user?.userType === UserType.PERSON || user?.userType === UserType.BRAND) && (
            <TouchableOpacity
              testID={getTestId('following')}
              onPress={() =>
                goToFollowingFollowers(user.username, 'Following', user.id)
              }
              accessibilityRole="button"
              accessibilityLabel={`${formatNumber(user.following?.length ?? 0)} Following`}
            >
              <Text color="white" bold size={12} align="center">
                {formatNumber(user.following?.length ?? 0)}
              </Text>
              <Link color="white" bold size={12} underlined>
                Following
              </Link>
            </TouchableOpacity>
          )}
          {user?.userType === UserType.BRAND && (
            <Text
              bold
              size={12}
              align="center"
              testID={getTestId('whiskeys-count')}
            >
              {formatNumber(user.brandWhiskeys?.items?.length ?? 0)}
              {'\n'}Whiskeys
            </Text>
          )}
          {user?.userType !== UserType.BRAND && (
            <Text bold size={12} align="center" testID={getTestId('check-ins')}>
              {formatNumber(checkins ?? 0)}
              {'\n'}
              {user?.userType === UserType.PERSON ? 'Venues' : 'Check-ins'}
            </Text>
          )}
          {user?.userType === UserType.PERSON && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(Routes.UserClubsList, {
                  userId: user?.id,
                  username: user?.username,
                })
              }
              testID={getTestId('clubs')}
              accessibilityRole="button"
              accessibilityLabel={`${formatNumber(clubsCount)} Clubs`}
            >
              <Text color="white" bold size={12} align="center">
                {formatNumber(clubsCount)}
              </Text>
              <Link color="white" bold size={12} underlined>
                Clubs
              </Link>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <Skeleton height={36} width={50} />
          <Skeleton height={36} width={50} />
          <Skeleton height={36} width={50} />
          <Skeleton height={36} width={50} />
          <Skeleton height={36} width={50} />
        </>
      )}
    </StatusWrapper>
  );
};
export { FollowInfoAndCheckin };
