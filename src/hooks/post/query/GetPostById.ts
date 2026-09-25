import { gql } from 'graphql-request';

const GetPostById = gql`
  query GetUser($id: ID!) {
    getPost(id: $id) {
      id
      authorId
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
        sharedPostId
        shareComment
        sharesCount
        clubId
        clubIsPrivate
        club {
          id
          clubName
        }
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
          }
          createdAt
        }
        createdAt
      }
      shareComment
      clubId
      clubIsPrivate
      club {
        id
        clubName
      }
      createdAt
    }
  }
`;
export { GetPostById };
