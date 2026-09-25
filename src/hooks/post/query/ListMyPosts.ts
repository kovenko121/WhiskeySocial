import { gql } from 'graphql-request';

const ListMyPosts = gql`
   query ListMyPosts($nextToken: String, $id: ID!) {
    postsByAuthorIdAndCreatedAt(
      nextToken: $nextToken
      authorId: $id
      sortDirection: DESC
      limit: 10
    ) {
      nextToken
      items {
        id
        author {
          id
          personFirstName
          personLastName
          userType
          venueName
          brandName
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
        photos {
          key
          bucket
          region
          width
          height
        }
        photoKeys
        photoWidths
        photoHeights
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
        title
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
        description
        clubId
        clubIsPrivate
        club {
          id
          clubName
          profilePicture
        }
        sharedPostId
        sharesCount
        sharedPost {
          id
          owner
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
          photos {
            key
            bucket
            region
            width
            height
          }
          photoKeys
          photoWidths
          photoHeights
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
          title
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
          description
          clubId
          clubIsPrivate
          club {
            id
            clubName
            profilePicture
          }
          sharedPostId
          shareComment
          sharesCount
          sharedPost {
            id
            owner
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
            photos {
              key
              bucket
              region
              width
              height
            }
            photoKeys
            photoWidths
            photoHeights
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
            title
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
            description
            clubId
            clubIsPrivate
            club {
              id
              clubName
              profilePicture
            }
            createdAt
          }
          createdAt
        }
        shareComment
        createdAt
        locationId
      }
    }
  }
`;

export { ListMyPosts };
