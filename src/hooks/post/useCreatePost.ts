import { useAuth } from '@contexts';
import { amplify, queryClient, getCurrentScreenName } from '@services';
import {
  Post,
  ReferenceType,
  User,
  Whiskey,
  InlineTagInput,
  InlineTagType,
} from '@types';
import { useMutation } from '@tanstack/react-query';
import { UnauthorizedClubActionError } from '@helpers';
import awsconfig from '../../config/aws';
import { createLogger } from '../../services/logger';
import { validateClubMembership } from '../clubs/useValidateClubMembership';
import { cioRecordCheckIn } from '../../config/customerio';
import { trackPostCreated, trackPourCreated } from './composerAnalytics';

import { CreatePost } from './mutation/createPost';
import { CreateUserPour } from './mutation/createUserPour';
import { UpdateUserPour } from './mutation/updateUserPour';
import { GetWhiskey } from './query/getWhiskeysForPours';
import { CheckUserPour } from './query/checkUserPour';

const logger = createLogger('useCreatePost');

type CreatePostResult = {
  post: Post;
  pourRecordId?: string;
};

const useCreatePost = (
  onSuccess: () => void,
  onPostCreated?: (postId: string, hasPhoto: boolean) => void,
  onError?: (error: Error) => void
) => {
  const {
    user: { sub },
  } = useAuth();

  const getReferences = (
    whiskey: Whiskey | undefined,
    checkin: User | undefined,
    tagUser: User | undefined
  ) => {
    const name = [whiskey?.brandUser?.brandName, whiskey?.name].filter(Boolean).join(' ');

    if (whiskey && checkin && tagUser) {
      return {
        references: [
          {
            id: whiskey.id,
            name,
            type: ReferenceType.WHISKEY,
            externalId: '',
          },
          {
            id: checkin.username !== '' ? checkin.id : '',
            name: checkin.venueName,
            type: ReferenceType.USER,
            externalId: checkin.username !== '' ? '' : checkin.id,
          },
          {
            id: tagUser.id,
            name: `${tagUser.personFirstName} ${tagUser.personLastName}`,
            type: ReferenceType.USER,
            externalId: '',
          },
        ],
        locationId: checkin.id,
        title: 'is drinking a $0 at $1 with $2',
      };
    }
    if (whiskey && checkin) {
      return {
        references: [
          {
            id: whiskey.id,
            name,
            type: ReferenceType.WHISKEY,
            externalId: '',
          },
          {
            id: checkin.username !== '' ? checkin.id : '',
            name: checkin.venueName,
            type: ReferenceType.USER,
            externalId: checkin.username !== '' ? '' : checkin.id,
          },
        ],
        title: 'is drinking a $0 at $1',
        locationId: checkin.id,
      };
    }
    if (whiskey && tagUser) {
      return {
        references: [
          {
            id: whiskey.id,
            name,
            type: ReferenceType.WHISKEY,
          },
          {
            id: tagUser.id,
            name: `${tagUser.personFirstName} ${tagUser.personLastName}`,
            type: ReferenceType.USER,
          },
        ],
        title: 'is drinking a $0 with $1',
      };
    }
    if (checkin && tagUser) {
      return {
        references: [
          {
            id: checkin.username !== '' ? checkin.id : '',
            name: checkin.venueName,
            type: ReferenceType.USER,
            externalId: checkin.username !== '' ? '' : checkin.id,
          },
          {
            id: tagUser.id,
            name: `${tagUser.personFirstName} ${tagUser.personLastName}`,
            type: ReferenceType.USER,
            externalId: '',
          },
        ],
        locationId: checkin.id,
        title: 'checked-in at $0 with $1',
      };
    }
    if (whiskey) {
      return {
        references: [
          {
            id: whiskey.id,
            name,
            type: ReferenceType.WHISKEY,
          },
        ],
        title: 'is drinking a $0',
      };
    }
    if (checkin) {
      return {
        references: [
          {
            id: checkin.username !== '' ? checkin.id : '',
            name: checkin.venueName,
            type: ReferenceType.USER,
            externalId: checkin.username !== '' ? '' : checkin.id,
          },
        ],
        title: 'checked-in at $0',
        locationId: checkin.id,
      };
    }
    if (tagUser) {
      return {
        references: [
          {
            id: tagUser.id,
            name: `${tagUser.personFirstName} ${tagUser.personLastName}`,
            type: ReferenceType.USER,
          },
        ],
        title: 'is with $0',
      };
    }

    return { references: [], title: '' };
  };

  return useMutation<
    CreatePostResult,
    unknown,
    {
      pourId: string;
      whiskey: Whiskey | undefined;
      checkin: User | undefined;
      tagUser: User | undefined;
      description: string | undefined;
      photoKey?: string | undefined;
      photoKeys?: string[] | undefined;
      photoDimensions?: Array<{ width?: number; height?: number }> | undefined;
      inlineTags?: InlineTagInput[];
      whiskeyDisplayNames?: Record<string, string>;
      clubId?: string;
      clubIsPrivate?: boolean;
    },
    { sourceScreen: string }
  >({
    // Read the surface the composer was opened from while it is still current: the
    // mutation resolves over the network, by which time the user may have moved on.
    onMutate: () => ({ sourceScreen: getCurrentScreenName() }),
    mutationFn: async (data) => {
      // Validate club membership before creating club posts
      if (data.clubId) {
        const { isValid } = await validateClubMembership(data.clubId, sub);
        if (!isValid) {
          throw new UnauthorizedClubActionError(
            'You are not a member of this club'
          );
        }
      }

      const { references, title, locationId } = getReferences(
        data.whiskey,
        data.checkin,
        data.tagUser
      );

      const requestData: any = {
        authorId: sub,
        title,
        description:
          data?.description?.trim() === '' ? '' : data.description?.trim(),
        references,
        locationId,
        whiskeyId: data.whiskey?.id,
        whiskeyFullName: data.whiskey?.fullName,
      };

      // Add club fields if provided (for club posts)
      if (data.clubId) {
        requestData.clubId = data.clubId;
        requestData.clubIsPrivate = data.clubIsPrivate ?? false;
      }

      // Add inline tags if provided
      if (data.inlineTags && data.inlineTags.length > 0) {
        requestData.inlineTags = data.inlineTags;
      }

      // Only add photo and moderation status if there's actually a photo
      const dimensionsAt = (index: number) => {
        const { width, height } = data.photoDimensions?.[index] ?? {};
        return width && height ? { width, height } : {};
      };

      if (data.photoKeys && data.photoKeys.length > 0) {
        const [firstKey] = data.photoKeys;
        requestData.photo = {
          key: firstKey,
          bucket: awsconfig.aws_user_files_s3_bucket,
          region: awsconfig.aws_user_files_s3_bucket_region,
          ...dimensionsAt(0),
        };
        requestData.photoKey = firstKey;
        requestData.photoModerationStatus = 'PENDING';
        requestData.photos = data.photoKeys.map((key, index) => ({
          key,
          bucket: awsconfig.aws_user_files_s3_bucket,
          region: awsconfig.aws_user_files_s3_bucket_region,
          ...dimensionsAt(index),
        }));
        requestData.photoKeys = data.photoKeys;

        // searchPosts drops nested object arrays, so the carousel's per-photo
        // dimensions have to travel as flat scalar arrays alongside photoKeys.
        if (data.photoDimensions?.some(({ width, height }) => width && height)) {
          requestData.photoWidths = data.photoKeys.map(
            (_, index) => data.photoDimensions?.[index]?.width ?? null
          );
          requestData.photoHeights = data.photoKeys.map(
            (_, index) => data.photoDimensions?.[index]?.height ?? null
          );
        }
      } else if (data.photoKey) {
        requestData.photo = {
          key: data.photoKey,
          bucket: awsconfig.aws_user_files_s3_bucket,
          region: awsconfig.aws_user_files_s3_bucket_region,
          ...dimensionsAt(0),
        };
        requestData.photoKey = data.photoKey;
        requestData.photoModerationStatus = 'PENDING';
      }
      // If no photo, don't set photoModerationStatus (defaults to null = public)

      const { createPost } = await amplify.request<{ createPost: Post }>(
        CreatePost,
        requestData
      );

      const whiskeyTags = (data.inlineTags ?? []).filter(
        (tag) => tag.type === InlineTagType.WHISKEY
      );
      const uniqueWhiskeyIds = Array.from(
        new Set(
          [data.whiskey?.id, ...whiskeyTags.map((tag) => tag.entityId)].filter(
            (id): id is string => !!id
          )
        )
      );

      const pourIdsByWhiskey: Record<string, string> = {};

      if (uniqueWhiskeyIds.length > 0) {
        try {
          const whiskeyDisplayNames: Record<string, string> = {
            ...(data.whiskeyDisplayNames || {}),
          };
          if (data.whiskey?.id && data.whiskey.fullName) {
            whiskeyDisplayNames[data.whiskey.id] = data.whiskey.fullName;
          }

          const missingWhiskeyIds = uniqueWhiskeyIds.filter(
            (id) => !whiskeyDisplayNames[id]
          );

          if (missingWhiskeyIds.length > 0) {
            const fetches = await Promise.all(
              missingWhiskeyIds.map(async (id) => {
                const { getWhiskey } = await amplify.request<{
                  getWhiskey: { id: string; fullName: string };
                }>(GetWhiskey, { id });
                return { id, fullName: getWhiskey.fullName };
              })
            );
            fetches.forEach(({ id, fullName }) => {
              whiskeyDisplayNames[id] = fullName;
            });
          }

          const pourResults = await Promise.all(
            uniqueWhiskeyIds.map(async (whiskeyId) => {
              try {
                const fullName = whiskeyDisplayNames[whiskeyId];

                const { searchUserPours } = await amplify.request<{
                  searchUserPours: {
                    items: Array<{ id: string; count: number }>;
                  };
                }>(CheckUserPour, {
                  filter: {
                    userId: { eq: sub },
                    whiskeyId: { eq: whiskeyId },
                  },
                });

                const existingPour = searchUserPours?.items?.[0];

                if (existingPour) {
                  await amplify.request(UpdateUserPour, {
                    id: existingPour.id,
                    count: (existingPour.count || 0) + 1,
                  });
                  return { whiskeyId, pourId: existingPour.id };
                }

                const { createUserPours } = await amplify.request<{
                  createUserPours: { id: string };
                }>(CreateUserPour, {
                  userId: sub,
                  whiskeyId,
                  whiskeyFullName: fullName,
                  count: 1,
                });
                return { whiskeyId, pourId: createUserPours?.id };
              } catch (err) {
                logger.error(
                  `Error creating/updating pour for whiskey ${whiskeyId}:`,
                  err as Error
                );
                return { whiskeyId, pourId: undefined };
              }
            })
          );

          pourResults.forEach(({ whiskeyId, pourId }) => {
            if (pourId) pourIdsByWhiskey[whiskeyId] = pourId;
          });
        } catch (error) {
          logger.error('Error creating pours for whiskeys:', error as Error);
        }
      }

      return {
        post: createPost,
        pourRecordId: data.whiskey?.id
          ? pourIdsByWhiskey[data.whiskey.id]
          : undefined,
      };
    },
    onSuccess({ post: createdPost, pourRecordId }, variables, context) {
      // Track the post for moderation polling if it has a photo
      if (onPostCreated && (createdPost.photo?.key || (createdPost.photos && createdPost.photos.length > 0))) {
        onPostCreated(createdPost.id, true);
      }

      const bottleId = variables.whiskey?.id;
      const venueId = variables.checkin?.id;
      const venueName =
        variables.checkin?.venueName ?? variables.whiskey?.brandUser?.venueName ?? undefined;

      const common = {
        postId: createdPost.id,
        userId: sub,
        sourceScreen: context?.sourceScreen ?? getCurrentScreenName(),
        photoAttached: !!variables.photoKey || (variables.photoKeys?.length ?? 0) > 0,
        noteLength: variables.description?.length ?? 0,
        venueId,
        venueName,
        clubId: variables.clubId,
      };

      if (bottleId && pourRecordId) {
        trackPourCreated({
          ...common,
          pourId: variables.pourId,
          pourRecordId,
          bottleId,
          bottleName: variables.whiskey?.name ?? undefined,
          brandId: variables.whiskey?.brandUser?.id,
          brandName:
            variables.whiskey?.brandUser?.brandName ??
            variables.whiskey?.brandUser?.venueName ??
            undefined,
        });

        cioRecordCheckIn(sub).catch((err) =>
          logger.error('Error recording check-in for Customer.io', err as Error)
        );
      } else {
        trackPostCreated({
          ...common,
          inlineWhiskeyTagCount: (variables.inlineTags ?? []).filter(
            (tag) => tag.type === InlineTagType.WHISKEY
          ).length,
        });
      }

      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['get-posts'] });
        queryClient.refetchQueries({ queryKey: ['list-user-rewards'] });
        queryClient.refetchQueries({ queryKey: ['check-user-pours'] });
        queryClient.refetchQueries({ queryKey: ['search-user-pours'] });

        // Refetch club posts if this was a club post
        if (variables.clubId) {
          queryClient.refetchQueries({
            queryKey: ['club-posts', variables.clubId],
          });
        }

        onSuccess();
      }, 2000);
    },
    onError: (error) => {
      if (onError) {
        onError(error as Error);
      }
    },
  });
};

export { useCreatePost };
