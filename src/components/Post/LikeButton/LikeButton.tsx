import { useUpdatePostLikes, useGuestGuard } from '@hooks';
import { useAuth } from '@contexts';
import { PostLikeAction } from '@types';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from '../../Icon/Icon';
import { Text } from '../../Text/Text';
import { createLogger } from '../../../services/logger';

const logger = createLogger('LikeButton');

type LikeButtonProps = {
  postId: string;
  like: [
    {
      id: string;
      postId: string;
    }
  ];
  isFetching: boolean;
  likesCount: number;
  canLike?: boolean;
};

export const LikeButton = ({
  postId,
  like,
  isFetching,
  likesCount,
  canLike = true,
}: LikeButtonProps) => {
  const [likeState, setLikeState] = useState(!!like.length);
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount || 0);
  const { mutate, isPending } = useUpdatePostLikes();
  const { user } = useAuth();
  const guardGuest = useGuestGuard('default');

  const handleLike = () => {
    if (!user?.sub || isPending || isFetching || !canLike) return;

    const action = likeState ? PostLikeAction.unlike : PostLikeAction.like;

    // Optimistic update
    setLikeState(!likeState);
    setCurrentLikesCount((prev) =>
      likeState ? Math.max(0, prev - 1) : prev + 1
    );

    mutate(
      {
        userId: user.sub,
        postId,
        action,
      },
      {
        onSuccess: (data) => {
          // Update with actual count from backend
          setCurrentLikesCount(data.likesCount);

          // Ensure UI state matches backend success
          if (data.success) {
            setLikeState(action === PostLikeAction.like);
          }
        },
        onError: (error) => {
          // Rollback optimistic update on error
          setLikeState(!!like.length);
          setCurrentLikesCount(likesCount || 0);
          logger.error('Failed to update like:', error);
        },
      }
    );
  };

  // TODO: So the useEffects feel a bit smelly to me. I think there's a better way to handle this but ATM it's probably too much work.

  // useEffects to sync state with props
  useEffect(() => {
    setCurrentLikesCount(likesCount || 0);
  }, [likesCount]);

  return (
    <TouchableOpacity
      onPress={() => guardGuest(handleLike)}
      testID={likeState ? 'disliked' : 'liked'}
      disabled={!canLike}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <Icon name="heart" color={likeState ? 'red' : 'white'} size={25} />
        {currentLikesCount > 0 && (
          <Text size={14} color="white">
            {currentLikesCount}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
