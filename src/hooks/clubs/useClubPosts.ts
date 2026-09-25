import { useAuth } from '@contexts';
import { amplify } from '@services';
import { Post } from '@types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const ListClubPosts = gql`
  query ListClubPosts(
    $clubId: ID!
    $sortDirection: ModelSortDirection
    $limit: Int
    $nextToken: String
  ) {
    postsByClubIdAndCreatedAt(
      clubId: $clubId
      sortDirection: $sortDirection
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        owner
        authorId
        description
        title
        clubId
        clubIsPrivate
        createdAt
        updatedAt
        author {
          id
          personFirstName
          personLastName
          userType
          venueName
          brandName
          deleted
          profilePicture {
            bucket
            key
            region
          }
          brandLogo {
            bucket
            key
            region
          }
        }
        photo {
          key
          bucket
          region
          width
          height
        }
        photoModerationStatus
        likes {
          items {
            id
            userId
          }
        }
        likesCount
        comments {
          items {
            id
            author {
              id
              username
            }
            text
          }
        }
        references {
          id
          name
          type
          externalId
        }
        inlineTags {
          id
          type
          entityId
          text
          startIndex
          endIndex
        }
        sharedPostId
        shareComment
        sharesCount
        sharedPost {
          id
          owner
          authorId
          description
          title
          clubId
          clubIsPrivate
          createdAt
          author {
            id
            personFirstName
            personLastName
            userType
            venueName
            brandName
            deleted
            profilePicture {
              bucket
              key
              region
            }
            brandLogo {
              bucket
              key
              region
            }
          }
          photo {
            key
            bucket
            region
            width
            height
          }
          photoModerationStatus
          likes {
            items {
              id
              userId
            }
          }
          likesCount
          comments {
            items {
              id
              author {
                id
                username
              }
              text
            }
          }
          references {
            id
            name
            type
            externalId
          }
          inlineTags {
            id
            type
            entityId
            text
            startIndex
            endIndex
          }
          sharedPostId
          shareComment
          sharesCount
          sharedPost {
            id
            owner
            authorId
            description
            title
            clubId
            clubIsPrivate
            createdAt
            author {
              id
              personFirstName
              personLastName
              userType
              venueName
              brandName
              deleted
              profilePicture {
                bucket
                key
                region
              }
              brandLogo {
                bucket
                key
                region
              }
            }
            photo {
              key
              bucket
              region
              width
              height
            }
            photoModerationStatus
            likes {
              items {
                id
                userId
              }
            }
            likesCount
            comments {
              items {
                id
                author {
                  id
                  username
                }
                text
              }
            }
            references {
              id
              name
              type
              externalId
            }
            inlineTags {
              id
              type
              entityId
              text
              startIndex
              endIndex
            }
          }
        }
      }
      nextToken
    }
  }
`;

interface ListClubPostsResponse {
  items: Post[];
  nextToken: string | null;
}

/**
 * Custom hook to fetch posts for a specific club using infinite scrolling.
 * Uses postsByClubIdAndCreatedAt query (byPostClub GSI) to efficiently fetch posts by clubId.
 * Filters out posts with rejected/error moderation status and non-author pending posts.
 *
 * @param clubId - The ID of the club to fetch posts for
 * @returns The result of useInfiniteQuery with paginated club posts
 */
function useClubPosts(clubId: string) {
  const {
    user: { sub: currentUserId },
  } = useAuth();

  return useInfiniteQuery<ListClubPostsResponse>({
    queryKey: ['club-posts', clubId],
    queryFn: async ({ pageParam }) => {
      const { postsByClubIdAndCreatedAt } = await amplify.request<{
        postsByClubIdAndCreatedAt: ListClubPostsResponse;
      }>(ListClubPosts, {
        clubId,
        sortDirection: 'DESC',
        limit: 10,
        nextToken: pageParam || null,
      });

      // Filter posts based on moderation status
      // Show: APPROVED, null/undefined status, or PENDING if current user is author
      // Hide: REJECTED, ERROR
      const filteredItems = postsByClubIdAndCreatedAt.items.filter((post) => {
        const status = post.photoModerationStatus;

        // No photo or no moderation status - show
        if (!status) return true;

        // Approved - show
        if (status === 'APPROVED') return true;

        // Pending - only show if current user is author
        if (status === 'PENDING') {
          return post.authorId === currentUserId;
        }

        // Rejected or Error - hide
        return false;
      });

      return {
        items: filteredItems,
        nextToken: postsByClubIdAndCreatedAt.nextToken,
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
    enabled: !!clubId,
  });
}

export { useClubPosts };
