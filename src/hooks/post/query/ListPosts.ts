import { gql } from 'graphql-request';

const ListPosts = gql`
  query ListPosts(
    $nextToken: String
    $or: [SearchablePostFilterInput]
    $and: [SearchablePostFilterInput]
  ) {
    searchPosts(
      sort: { direction: desc, field: createdAt }
      nextToken: $nextToken
      filter: { or: $or, and: $and }
      limit: 10
    ) {
      nextToken
      items {
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
        photoModerationStatus
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
          photoModerationStatus
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
            photoModerationStatus
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
            createdAt
          }
          createdAt
        }
        shareComment
        createdAt
      }
    }
  }
`;

export { ListPosts };
