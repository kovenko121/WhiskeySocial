import {
  useCreateComment,
  useGetUser,
  useGetUserClubs,
  usePostById,
  usePostComments,
} from '@hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Comment } from '@types';
import { ComponentType, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard } from 'react-native';
import { useAuth } from '@contexts';
import { isUnauthorizedClubActionError } from '@helpers';
import { theme } from '@theme';
import { ModalBottom } from '../../ModalBottom/ModalBottom';
import { PostComment } from '../../PostComment/PostComment';
import { ProfilePicture } from '../../ProfilePicture/ProfilePicture';
import { Text } from '../../Text/Text';
import { TipDialog } from '../../TipDialog/TipDialog';
import { Icon } from '../../Icon/Icon';
import {
  CommentInput,
  CommentList,
  CommentPostContainer,
  ComposerRow,
  ContentContainer,
  Divider,
  NewCommentContainer,
  ProfilePictureContainer,
  PublishButton,
  PublishRow,
  RestrictedMessageContainer,
  RestrictedMessageText,
  TitleContainer,
} from './styles';

const CommentPostScreen = ({
  onBackButtonPress,
  visible,
  postId,
}: {
  onBackButtonPress: () => void;
  visible: boolean;
  postId: string;
}) => {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    usePostComments(postId);
  const { data: post } = usePostById(postId);
  const { data: myUser } = useGetUser();
  const {
    user: { sub },
  } = useAuth();
  const { data: userClubs } = useGetUserClubs({ userId: sub });
  const userClubIds = useMemo(
    () => userClubs?.map((club) => club.id) ?? [],
    [userClubs]
  );

  const [hasSeenHints, setHasSeenHints] = useState(true);
  const [comment, setComment] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  let isMyFirstComment = true;

  const backButtonExit = () => {
    setComment(undefined);
    onBackButtonPress();
  };

  const handleCreateCommentError = (error: Error) => {
    setIsSubmitting(false);
    const message = isUnauthorizedClubActionError(error)
      ? error.message
      : 'Something went wrong. Please try again.';
    Alert.alert('Cannot Comment', message, [
      { text: 'OK', onPress: backButtonExit },
    ]);
  };

  const { mutate, isPending: isCreatingComment } = useCreateComment(
    postId,
    post?.clubId,
    handleCreateCommentError
  );

  // Check if user is allowed to comment
  const canComment = useMemo(() => {
    // If post data hasn't loaded yet, default to true to avoid flickering
    if (!post) return true;

    // Non-club posts allow all comments
    if (!post.clubId) return true;

    // Club posts require active membership
    return userClubIds.includes(post.clubId);
  }, [post, userClubIds]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const onSubmit = () => {
    setIsSubmitting(true);

    if (!comment || comment === '' || comment?.trim() === '') {
      setIsSubmitting(false);
      return;
    }

    mutate(
      { text: comment.trim() },
      {
        onSuccess: () => {
          setComment(undefined);
          Keyboard.dismiss();
          setIsSubmitting(false);
        },
        onError: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  const isPublishing = isCreatingComment || isSubmitting;
  const canPublish = !!comment?.trim() && !isPublishing;

  const showHints = (authorId: string) => {
    if (authorId === myUser?.id && isMyFirstComment && !hasSeenHints) {
      isMyFirstComment = false;
      return true;
    }
    return false;
  };

  useEffect(() => {
    (async () => {
      const key = await AsyncStorage.getItem('viewedDeleteCommentHint');
      setHasSeenHints(key !== null);
    })();
  }, [data, setHasSeenHints]);

  return (
    <ModalBottom onBackButtonPress={backButtonExit} visible={visible}>
      <CommentPostContainer>
        <TitleContainer>
          <Text bold size={14}>
            Comments
          </Text>
        </TitleContainer>

        <ContentContainer>
          {!isLoading && data ? (
            <CommentList
              horizontal={false}
              showsVerticalScrollIndicator={false}
              data={
                data.pages
                  .flatMap((page) => page.items)
                  .filter(
                    ({ authorId }) => !myUser?.blockedUsers?.includes(authorId)
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  ) as Comment[]
              }
              renderItem={({ item }: { item: Comment }) => (
                <>
                  {showHints(item.authorId) && (
                    <TipDialog
                      message="Touch and hold over your comment if you want to delete it."
                      onClose={() => setHasSeenHints(true)}
                    />
                  )}

                  <PostComment
                    comment={item}
                    onClose={backButtonExit}
                    onLongPressComment={() => setHasSeenHints(true)}
                  />
                </>
              )}
              keyExtractor={(item: Comment) => item.id}
              onEndReached={handleLoadMore}
              ItemSeparatorComponent={
                (<Divider />) as unknown as ComponentType<any>
              }
            />
          ) : (
            <ActivityIndicator />
          )}
        </ContentContainer>
        {canComment ? (
          <NewCommentContainer>
            <ComposerRow>
              <ProfilePictureContainer>
                <ProfilePicture
                  size="small"
                  image={myUser?.profilePictureLoaded}
                  border
                  disabled
                />
              </ProfilePictureContainer>

              <CommentInput
                placeholder="Add a comment..."
                placeholderTextColor={theme.colors.black300}
                value={comment}
                onChangeText={setComment}
                maxLength={125}
                autoFocus
                multiline
                textAlignVertical="top"
              />
            </ComposerRow>

            <PublishRow>
              <PublishButton disabled={!canPublish} onPress={onSubmit}>
                {isPublishing && <ActivityIndicator />}
                {!isPublishing && (
                  <Text bold color={canPublish ? 'primary500' : 'grey300'}>
                    Publish
                  </Text>
                )}
              </PublishButton>
            </PublishRow>
          </NewCommentContainer>
        ) : (
          <RestrictedMessageContainer>
            <Icon name="lock" size={20} color="grey300" />
            <RestrictedMessageText>
              Join {post?.club?.clubName || 'this club'} to comment on this post
            </RestrictedMessageText>
          </RestrictedMessageContainer>
        )}
      </CommentPostContainer>
    </ModalBottom>
  );
};

export { CommentPostScreen };
