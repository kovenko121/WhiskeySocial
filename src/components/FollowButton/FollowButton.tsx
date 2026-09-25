import { getTestId } from '@helpers';
import { useFollowUser, useGetUser, useGuestGuard, useUnfollowUser } from '@hooks';
import { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { Tag } from '../Tags/Tags';
import { Text } from '../Text/Text';
import { UnfollowButton } from './styles';

export const FollowButton = ({
  data,
  isFetching,
  icon = false,
  onFollowStatusChange = () => {},
  unfollowOnly = false,
}: {
  data: any;
  isFetching: boolean;
  icon?: boolean;
  onFollowStatusChange?: (isFollowing: boolean) => void;
  unfollowOnly?: boolean;
}) => {
  const guardedFollow = useGuestGuard('follow');
  const { data: myUser } = useGetUser();

  const [followState, setFollowState] = useState(
    !!myUser?.following?.filter((id: string) => id === data.id).length
  );

  useEffect(() => {
    setFollowState(
      !!myUser?.following?.filter((id: string) => id === data.id).length
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUser]);

  const { mutate: mutateFollowUser, isLoading: isFollowLoading } =
    useFollowUser();
  const { mutate: mutateUnfollowUser, isLoading: isUnfollowLoading } =
    useUnfollowUser();

  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = () => {
    guardedFollow(() => {
      if (followState && !isUnfollowLoading && !isFetching) {
        mutateUnfollowUser({ id: data.id });
        setFollowState(false);
        onFollowStatusChange(false);
      } else if (!followState && !isFollowLoading && !isFetching) {
        mutateFollowUser({ id: data.id });
        setFollowState(true);
        onFollowStatusChange(true);
      }
    });
  };

  const handleUnfollow = () => {
    if (!isLoading && !isUnfollowLoading && !isFetching) setIsLoading(true);
    mutateUnfollowUser({ id: data.id });
    onFollowStatusChange(false);
  };

  return (
    <TouchableOpacity
      onPress={unfollowOnly ? handleUnfollow : handleFollow}
      testID={getTestId('follow')}
    >
      {!unfollowOnly ? (
        <Tag
          text={followState ? 'Unfollow' : 'Follow'}
          selected={followState}
          icon={icon && !followState ? 'add-user' : undefined}
        />
      ) : (
        <UnfollowButton>
          {isLoading ? <ActivityIndicator /> : <Text>Unfollow</Text>}
        </UnfollowButton>
      )}
    </TouchableOpacity>
  );
};
