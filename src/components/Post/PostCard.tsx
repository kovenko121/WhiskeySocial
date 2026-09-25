import React, { useEffect, useState } from 'react';
import { useAuth } from '@contexts';
import {
  useDeletePost,
  useDeleteClubPostAdmin,
  useGetUser,
  useGuestGuard,
  useSharePost,
} from '@hooks';
import { useNavigation } from '@react-navigation/native';
import {
  NavigationProps,
  Reference,
  ReferenceType,
  ReportContentType,
  UserType,
  type ImageUrl,
  type Post,
  type S3Object,
  Routes
} from '@types';
import { ImageSourcePropType, TouchableOpacity, Alert } from 'react-native';
import { getClampedAspectRatio, getS3Image, getTestId, getTimeAgo } from '@helpers';
import {
  FeedTapTarget,
  feedItemOf,
  trackFeedItemTapped,
} from '../../domains/Activity/data/feedAnalytics';
import { ImageViewerModal } from '../ImageViewerModal/ImageViewerModal';
import { Icon } from '../Icon/Icon';
import { PopUpMenu } from '../PopUpMenu/PopUpMenu';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { TaggedText } from '../TaggedText/TaggedText';
import { Link, Text } from '../Text/Text';
import { LikeButton } from './LikeButton/LikeButton';
import { ShareButton } from './ShareButton/ShareButton';
import { ShareOptionsModal } from './ShareOptionsModal';
import { SharePostModal } from './SharePostModal';
import { CommentPostScreen } from './CommentPostScreen/CommentPostScreen';
import { PhotoCarousel } from './PhotoCarousel';
import {
  AuthorSection,
  ClubBadge,
  ClubBadgeText,
  DeletedPostContainer,
  DescriptionContainer,
  DotIconContainer,
  Header,
  IconsSection,
  AspectImageContainer,
  AspectPostImage,
  ImageContainer,
  ItemHeader,
  ItemTitle,
  MaxDepthContainer,
  OptionsButton,
  OriginalPostContainer,
  PostBody,
  PostBottom,
  PostImage,
  PostDescription,
  PostMetaRow,
  PostWrapper,
  ProcessingBadge,
  ShareCommentContainer,
  SharedPostHeader,
  SharedPostHeaderContent,
  ShowCommentsContainer,
} from './styles';

// Style const for new components that will not be using styled-components, this is a new approach
// for when we switch over to using React Native's style sheet api.

export const PostCard = React.memo(
  ({
    post,
    onCommentPress,
    isFetching,
    from,
    padded = false,
    depth = 0,
    isClubAdmin = false,
    isPinned = false,
    onPinPost,
    onUnpinPost,
    userActiveClubIds = [],
    feedPosition,
  }: {
    post: Post;
    onCommentPress?: () => void;
    isFetching: boolean;
    from: {
      page: string;
      id?: string;
    };
    padded: boolean;
    depth?: number;
    isClubAdmin?: boolean;
    isPinned?: boolean;
    onPinPost?: () => void;
    onUnpinPost?: () => void;
    userActiveClubIds?: string[];
    // Only the instrumented feed passes this; everything else emits nothing.
    feedPosition?: number;
  }) => {
    const navigation = useNavigation<NavigationProps>();
    const {
      user: { sub } = {},
    } = useAuth();
    // Likes/comments/shares require an account; for guests these open the
    // sign-up nudge instead of running the action.
    const guardGuest = useGuestGuard('default');
    const { data: myUser } = useGetUser();
    const [profilePicture, setProfilePicture] = useState<
      ImageUrl | ImageSourcePropType
    >();
    const [postPictures, setPostPictures] = useState<Array<ImageUrl | ImageSourcePropType>>([]);
    const [imageModalIndex, setImageModalIndex] = useState(0);
    const [showPopUpMenu, setShowPopUpMenu] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [shareOptionsVisible, setShareOptionsVisible] = useState(false);
    const [sharePostModalVisible, setSharePostModalVisible] = useState(false);
    const [nestedCommentPostScreen, setNestedCommentPostScreen] =
      useState<boolean>(false);

    const { mutate: mutateDeletePost } = useDeletePost();

    const { mutate: mutateDeleteClubPostAdmin } = useDeleteClubPostAdmin(
      () => {
        Alert.alert('Success', 'Post deleted');
      },
      (error) => {
        Alert.alert('Error', error.message || 'Failed to delete post');
      }
    );

    const { mutate: mutateSharePost } = useSharePost(() => {
      Alert.alert('Success', 'Post shared to your feed!');
    });

    const totalComments = post?.comments?.items[0]
      ? post?.comments?.items.filter(
          (item) => !myUser?.blockedUsers?.includes(item?.author?.id!)
        ).length
      : 0;

    // Can like if: not own post AND if the post is in a club the user is active in
    const canLike =
      post.author?.id !== sub &&
      (!post?.clubId || userActiveClubIds.includes(post?.clubId || ''));

    useEffect(() => {
      const getProfilePicture = async (pic: S3Object) => {
        const img = await getS3Image(pic);
        if (img) setProfilePicture(img);
      };

      // Use brandLogo for BRAND users (with profilePicture fallback), profilePicture for others
      const authorPicture =
        post?.author?.userType === UserType.BRAND
          ? post?.author?.brandLogo || post?.author?.profilePicture
          : post?.author?.profilePicture;

      if (authorPicture?.key) {
        getProfilePicture(authorPicture);
      }
    }, [
      post?.author?.profilePicture,
      post?.author?.brandLogo,
      post?.author?.userType,
    ]);

    useEffect(() => {
      const loadPostPhotos = async () => {
        let photoSources: S3Object[] = [];

        if (post?.photos && post.photos.length > 0) {
          // Direct DynamoDB query — nested S3Object array intact
          photoSources = post.photos.filter((p): p is S3Object => p != null);
        } else if (post?.photoKeys && post.photoKeys.length > 0 && post?.photo) {
          // OpenSearch flattens [S3Object] arrays; reconstruct from photoKeys + single photo's bucket/region
          const { bucket, region } = post.photo;
          photoSources = post.photoKeys.flatMap((key, index) =>
            key
              ? [
                  {
                    __typename: 'S3Object' as const,
                    key,
                    bucket,
                    region,
                    width: post.photoWidths?.[index],
                    height: post.photoHeights?.[index],
                  },
                ]
              : []
          );
        } else if (post?.photo?.key) {
          photoSources = [post.photo];
        }

        if (photoSources.length === 0) {
          setPostPictures([]);
          return;
        }

        const loaded = await Promise.all(photoSources.map((p) => getS3Image(p)));
        setPostPictures(loaded.filter((img): img is ImageUrl => img != null));
      };

      loadPostPhotos();
    }, [
      post?.photos,
      post?.photoKeys,
      post?.photoWidths,
      post?.photoHeights,
      post?.photo,
    ]);

    const goToUserProfile = (id: string) => {
      if (id === sub) {
        navigation.navigate(Routes.MyCollection);
      } else {
        navigation.navigate(Routes.UserProfile, { id });
      }
    };

    const goToReportForm = () => {
      navigation.navigate(Routes.ReportForm, {
        contentId: post?.id,
        contentType: ReportContentType.POST,
        reportedUserId: post?.author?.id!,
        from,
      });
    };

    const redirect = ({ id, type }: Reference) => {
      switch (type) {
        case ReferenceType.WHISKEY:
          // Whiskey detail isn't available to guests, so nudge them to sign up.
          return guardGuest(() => navigation.navigate(Routes.WhiskeyInfo, { id }));
        default:
          return goToUserProfile(id);
      }
    };

    // Fires on the tap, not the navigation, so a guest sent to the sign-up nudge still counts.
    const trackFeedTap = (target: FeedTapTarget) => {
      if (feedPosition == null) return;
      trackFeedItemTapped(feedItemOf(post, feedPosition), target);
    };

    // Opening comments requires an account; guests get the sign-up nudge.
    const handleCommentPress = () => {
      trackFeedTap('comments');
      guardGuest(() => onCommentPress?.());
    };

    const getPostTitle = (title: string, references: Reference[]) => {
      if (!title || !references || references.length === 0) return '';

      return title.split(' ').map((word) => {
        if (word.startsWith('$')) {
          const referenceIndex = parseInt(word.substring(1), 10);
          const reference = references[referenceIndex];
          if (!reference) return ` ${word}`;
          return (
            <Text
              key={reference.id}
              bold={reference.id !== ''}
              size={14}
              onPress={() => redirect(reference)}
              disabled={reference.id === ''}
            >
              {' '}
              {reference.name}
            </Text>
          );
        }
        return ` ${word}`;
      });
    };

    // Resolve an author's display name based on their account type.
    const getAuthorName = (author: Post['author']) => {
      switch (author?.userType) {
        case UserType.PERSON:
          return `${author?.personFirstName} ${author?.personLastName}`;
        case UserType.BRAND:
          return author?.brandName;
        default:
          return author?.venueName;
      }
    };

    const deletePost = () => {
      mutateDeletePost({ postId: post.id, clubId: post.clubId || undefined });
    };

    const adminDeleteClubPost = () => {
      if (!post.clubId) return;

      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              mutateDeleteClubPostAdmin({
                postId: post.id,
                clubId: post.clubId!,
              });
            },
          },
        ]
      );
    };

    const pinPost = () => {
      if (onPinPost) {
        onPinPost();
      }
    };

    const unpinPost = () => {
      if (onUnpinPost) {
        onUnpinPost();
      }
    };

    // Build menu options based on context
    const buildMyPostOptions = () => {
      const menuOptions = [
        {
          id: 'delete-post',
          title: 'Delete',
          icon: 'trash',
          action: deletePost,
        },
      ];

      // Add pin/unpin for club admins on club posts
      if (isClubAdmin && post.clubId) {
        if (isPinned) {
          menuOptions.unshift({
            id: 'unpin-post',
            title: 'Unpin Post',
            icon: 'pin-off',
            action: unpinPost,
          });
        } else {
          menuOptions.unshift({
            id: 'pin-post',
            title: 'Pin Post',
            icon: 'pin',
            action: pinPost,
          });
        }
      }

      return menuOptions;
    };

    // Build options for other users' posts
    const buildOtherUserOptions = () => {
      const menuOptions = [
        {
          id: 'report-post',
          title: 'Report',
          icon: 'report',
          action: goToReportForm,
        },
      ];

      // Club admins can pin/unpin and delete any post in their club
      if (isClubAdmin && post.clubId) {
        menuOptions.unshift({
          id: 'delete-post',
          title: 'Delete',
          icon: 'trash',
          action: adminDeleteClubPost,
        });

        if (isPinned) {
          menuOptions.unshift({
            id: 'unpin-post',
            title: 'Unpin Post',
            icon: 'pin-off',
            action: unpinPost,
          });
        } else {
          menuOptions.unshift({
            id: 'pin-post',
            title: 'Pin Post',
            icon: 'pin',
            action: pinPost,
          });
        }
      }

      return menuOptions;
    };

    const myPostOptions = buildMyPostOptions();
    const options = buildOtherUserOptions();

    // func to handle closing the image view modal
    const toggleImageModal = () => {
      setImageModalVisible((prev) => !prev);
    };

    // Toggle the options popup menu, ignoring taps while it is mid-close animation.
    const togglePopUpMenu = () => {
      if (isClosing) return;
      setShowPopUpMenu((prev) => !prev);
    };

    // Handle share action
    const handleSharePress = () => {
      // Allow sharing shares (Twitter-style layered quotes)
      const postToShare = post;
      // ORIGINAL: Prevent sharing a share (always share the original)
      // const postToShare = post.sharedPostId && post.sharedPost ? post.sharedPost : post;

      if (!postToShare) {
        Alert.alert('Error', 'Cannot share this post.');
        return;
      }

      // Check if the original post author is deleted or missing
      if (!postToShare.author || !postToShare.author.id) {
        Alert.alert('Cannot Share', 'This post is no longer available.');
        return;
      }

      // Check if user is blocked (check original author, not sharer)
      if (myUser?.blockedUsers?.includes(postToShare.author.id)) {
        Alert.alert(
          'Cannot Share',
          'You cannot share posts from blocked users.'
        );
        return;
      }

      // Show share options modal
      setShareOptionsVisible(true);
    };

    const handleQuickShare = () => {
      setShareOptionsVisible(false);
      const postToShare = post;
      // ORIGINAL: const postToShare = post.sharedPostId && post.sharedPost ? post.sharedPost : post;
      // Use embedded post's club info if outer post doesn't have it (preserves privacy)
      mutateSharePost({
        sharedPostId: postToShare.id,
        clubId:
          postToShare.clubId || postToShare.sharedPost?.clubId || undefined,
        clubIsPrivate:
          postToShare.clubIsPrivate ??
          postToShare.sharedPost?.clubIsPrivate ??
          undefined,
      });
    };

    const handleShareWithComment = () => {
      setShareOptionsVisible(false);
      // Add delay to allow first modal to fully dismiss before opening second
      // Longer delay needed for posts with images to avoid modal conflicts
      setTimeout(() => {
        setSharePostModalVisible(true);
      }, 500);
    };

    const handleSharePostSubmit = (comment: string) => {
      setSharePostModalVisible(false);
      const postToShare = post;
      // ORIGINAL: const postToShare = post.sharedPostId && post.sharedPost ? post.sharedPost : post;
      // Use embedded post's club info if outer post doesn't have it (preserves privacy)
      mutateSharePost({
        sharedPostId: postToShare.id,
        shareComment: comment || undefined,
        clubId:
          postToShare.clubId || postToShare.sharedPost?.clubId || undefined,
        clubIsPrivate:
          postToShare.clubIsPrivate ??
          postToShare.sharedPost?.clubIsPrivate ??
          undefined,
      });
    };

    // Handle image resolution for the modal photo

    // Determine if this is a quick share (share without comment)
    const isQuickShare = post.sharedPostId && !post.shareComment;

    // Renders the embedded original post for a share, capping nesting depth to
    // guard against infinite recursion.
    const renderSharedPost = () => {
      if (depth >= 2) {
        // NOTE: This code path is currently unreachable because the GraphQL query only fetches 2 levels of nested sharedPost data.
        // This will be used when nested posts are clickable and the query is updated to support deeper nesting.
        // Maximum depth reached - prevent infinite recursion
        return (
          <MaxDepthContainer>
            <Text size={12} color="white" align="center">
              This post contains multiple layers of shares
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(Routes.PostScreen, {
                  id: post.sharedPost?.id ?? post.id,
                })
              }
            >
              <Text size={12} color="white" align="center" bold>
                View original post →
              </Text>
            </TouchableOpacity>
          </MaxDepthContainer>
        );
      }

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            trackFeedTap('post_detail');
            guardGuest(() =>
              navigation.navigate(Routes.PostScreen, {
                id: post.sharedPost!.id,
              })
            );
          }}
        >
          <OriginalPostContainer>
            <PostCard
              post={post.sharedPost!}
              onCommentPress={() => setNestedCommentPostScreen(true)}
              isFetching={isFetching}
              from={from}
              padded={false}
              depth={depth + 1}
              userActiveClubIds={userActiveClubIds}
            />
          </OriginalPostContainer>
        </TouchableOpacity>
      );
    };

    const firstAspectRatio = getClampedAspectRatio(postPictures[0]);
    const singleAspectRatio =
      postPictures.length === 1 ? firstAspectRatio : null;

    const PhotoBox = firstAspectRatio ? AspectImageContainer : ImageContainer;
    const SinglePhoto = singleAspectRatio ? AspectPostImage : PostImage;

    // Renders this post's own description and photos (non-share content).
    const renderPostContent = () => (
      <>
        {post.description ? (
          <DescriptionContainer>
            {post.inlineTags?.length ? (
              <TaggedText
                content={post.description}
                tags={post.inlineTags}
                size={11}
                color="grey25"
              />
            ) : (
              <PostDescription size={11} color="grey25">
                {post.description}
              </PostDescription>
            )}
          </DescriptionContainer>
        ) : null}

        {postPictures.length > 0 && (
          <PhotoBox>
            {postPictures.length === 1 ? (
              <TouchableOpacity
                onPress={() => {
                  setImageModalIndex(0);
                  toggleImageModal();
                }}
                activeOpacity={0.8}
                testID={getTestId('post-image')}
              >
                <SinglePhoto
                  source={postPictures[0]}
                  contentFit="cover"
                  style={
                    singleAspectRatio ? { aspectRatio: singleAspectRatio } : undefined
                  }
                />
                {post?.photoModerationStatus === 'PENDING' && (
                  <ProcessingBadge>
                    <Text size={12} color="white">
                      Processing...
                    </Text>
                  </ProcessingBadge>
                )}
              </TouchableOpacity>
            ) : (
              <PhotoCarousel
                images={postPictures}
                onImagePress={(index) => {
                  setImageModalIndex(index);
                  toggleImageModal();
                }}
                moderationPending={post?.photoModerationStatus === 'PENDING'}
              />
            )}
          </PhotoBox>
        )}
      </>
    );

    return (
      <PostWrapper padded={padded}>
        <PostBody key={post.id}>
          {/* Only show header/author info for non-quick-shares */}
          {!isQuickShare && (
            <>
              <Header>
                <AuthorSection>
                  <ProfilePicture
                    image={profilePicture}
                    size="small"
                    onPress={() => goToUserProfile(post.author?.id!)}
                  />
                  <ItemHeader>
                    <ItemTitle>
                      <Text align="left" size={14}>
                        <Text
                          bold
                          size={14}
                          onPress={() => goToUserProfile(post.author?.id!)}
                        >
                          {getAuthorName(post.author)}
                          {post.author?.userType === UserType.PERSON ? ' ' : ''}
                        </Text>
                        {getPostTitle(post.title!, post.references!)}
                      </Text>
                      <PostMetaRow>
                        <Text color="secondary300">
                          {getTimeAgo(post.createdAt)}
                        </Text>
                        {post.club?.clubName && (
                          <ClubBadge
                            onPress={() =>
                              navigation.navigate(Routes.ClubProfile, {
                                clubId: post.clubId!,
                              })
                            }
                          >
                            <Icon
                              name="wine-glass"
                              color="primary500"
                              size={12}
                            />
                            <ClubBadgeText>{post.club.clubName}</ClubBadgeText>
                          </ClubBadge>
                        )}
                      </PostMetaRow>
                    </ItemTitle>
                  </ItemHeader>
                </AuthorSection>
                <OptionsButton onPress={togglePopUpMenu}>
                  <DotIconContainer testID={getTestId('options')}>
                    <Icon name="dot-menu-horizontal" color="white" size={18} />
                  </DotIconContainer>
                </OptionsButton>
              </Header>
              {showPopUpMenu && (
                <PopUpMenu
                  width={50}
                  options={post.author?.id === sub ? myPostOptions : options}
                  alignItems="bottom"
                  paddingBottom={20}
                  paddingLeft={105}
                  setVisibleStatus={setShowPopUpMenu}
                  setIsClosingStatus={setIsClosing}
                />
              )}
            </>
          )}

          {/* Show shared post header if this is a shared post */}
          {post.sharedPostId && (
            <>
              <SharedPostHeader>
                <SharedPostHeaderContent>
                  <Icon name="share" color="primary500" size={16} />
                  <Text size={12} color="grey25">
                    {post.author?.id === sub ? (
                      'You shared'
                    ) : (
                      <>
                        Shared by{' '}
                        <Text
                          bold
                          size={12}
                          onPress={() => goToUserProfile(post.author?.id!)}
                        >
                          {getAuthorName(post.author)}
                        </Text>
                      </>
                    )}
                  </Text>
                </SharedPostHeaderContent>
                {/* Show menu for quick shares (owned by current user) */}
                {isQuickShare && post.author?.id === sub && (
                  <OptionsButton onPress={togglePopUpMenu}>
                    <DotIconContainer testID={getTestId('options')}>
                      <Icon
                        name="dot-menu-horizontal"
                        color="white"
                        size={18}
                      />
                    </DotIconContainer>
                  </OptionsButton>
                )}
              </SharedPostHeader>
              {/* Show popup menu for quick shares */}
              {isQuickShare && post.author?.id === sub && showPopUpMenu && (
                <PopUpMenu
                  width={50}
                  options={myPostOptions}
                  alignItems="bottom"
                  paddingBottom={20}
                  paddingLeft={105}
                  setVisibleStatus={setShowPopUpMenu}
                  setIsClosingStatus={setIsClosing}
                />
              )}
              {/* Show share comment if user added one */}
              {post.shareComment && (
                <ShareCommentContainer>
                  <Text size={14} color="grey25">
                    {post.shareComment}
                  </Text>
                </ShareCommentContainer>
              )}
            </>
          )}

          {/* Handle deleted original post */}
          {post.sharedPostId && !post.sharedPost && (
            <DeletedPostContainer>
              <Text size={12} color="white" align="center">
                This post is no longer available
              </Text>
            </DeletedPostContainer>
          )}

          {/* Render shared post content if this is a share, otherwise render normal post content */}
          {post.sharedPostId && post.sharedPost
            ? renderSharedPost()
            : renderPostContent()}

          {/* Only show interaction buttons for non-quick-shares and posts with depth < 2 */}
          {!isQuickShare && depth < 2 && (
            <PostBottom>
              <IconsSection>
                <LikeButton
                  postId={post.id}
                  like={post.likes?.items.filter(
                    ({ userId }) => userId === sub
                  )}
                  isFetching={isFetching}
                  likesCount={post.likesCount}
                  canLike={canLike}
                />
                <TouchableOpacity
                  onPress={handleCommentPress}
                  testID={getTestId('comment')}
                >
                  <Icon name="message" color="white" size={23} />
                </TouchableOpacity>
                {/* Hide share button if user can't share (not a member of the club) */}
                {!(
                  !post.author?.id ||
                  (!!post.clubId && !userActiveClubIds.includes(post.clubId))
                ) && (
                  <ShareButton
                    sharesCount={post.sharesCount}
                    onPress={() => guardGuest(handleSharePress)}
                  />
                )}
              </IconsSection>
              {!!totalComments && (
                <ShowCommentsContainer onPress={handleCommentPress}>
                  <Link
                    align="left"
                    color="primary500"
                    testID={getTestId('see-comments')}
                  >
                    see {totalComments}{' '}
                    {totalComments === 1 ? 'comment' : 'comments'}
                  </Link>
                </ShowCommentsContainer>
              )}
            </PostBottom>
          )}
        </PostBody>
        {postPictures.length > 0 && (
          <ImageViewerModal
            isVisible={imageModalVisible}
            onDownSwipe={toggleImageModal}
            onBackdropPress={toggleImageModal}
            images={postPictures}
            initialIndex={imageModalIndex}
          />
        )}
        <ShareOptionsModal
          visible={shareOptionsVisible}
          onClose={() => setShareOptionsVisible(false)}
          onQuickShare={handleQuickShare}
          onShareWithComment={handleShareWithComment}
        />
        <SharePostModal
          visible={sharePostModalVisible}
          onClose={() => setSharePostModalVisible(false)}
          post={post.sharedPostId && post.sharedPost ? post.sharedPost : post}
          onSubmit={handleSharePostSubmit}
        />
        {/* Comment modal for nested shared posts - only render at depth < 2 */}
        {post.sharedPostId && post.sharedPost && depth < 2 && (
          <CommentPostScreen
            onBackButtonPress={() => setNestedCommentPostScreen(false)}
            visible={nestedCommentPostScreen}
            postId={post.sharedPost.id}
          />
        )}
      </PostWrapper>
    );
  }
);
