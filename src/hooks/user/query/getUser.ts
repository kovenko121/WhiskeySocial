import { gql } from 'graphql-request';

const GetUser = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      personFirstName
      personLastName
      isMyCollectionPublic
      blockedUsers
      venueName
      venuePhone
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCheckinsCount
      venueWebsite
      venueHours
      toBeRedeemed
      venueMenu {
        bucket
        key
        region
      }
      venueAddressGeo {
        lat
        lon
      }
      profilePicture {
        bucket
        key
        region
      }
      profilePictureModerationStatus
      coverPicture {
        bucket
        key
        region
      }
      coverPictureModerationStatus
      brandLogo {
        bucket
        key
        region
      }
      userType
      username
      bio
      brandName
      brandDescription
      brandStory
      brandId

      securitySettings {
        description
        name
        value
      }
      notificationSettings {
        description
        name
        value
      }
      dmPrivacySetting
      wishList {
        items {
          id
          createdAt
          whiskeyId
          whiskey {
            brand
            id
            name
            age
            picture {
              bucket
              key
              region
            }
            brandPicture {
              bucket
              key
              region
            }
            brandUser {
              id
              brandName
              brandLogo {
                bucket
                key
                region
              }
              userType
            }
            type
            calculatedRating
            reviews {
              items {
                rating
              }
            }
          }
        }
      }
      whiskeys(limit: 1000000) {
        items {
          id
          createdAt
          proof
          proofType
          age
          archived
          whiskey {
            brand
            id
            name
            age
            proof
            proofType
            picture {
              bucket
              key
              region
            }
            brandPicture {
              bucket
              key
              region
            }
            brandUser {
              id
              brandName
              brandLogo {
                bucket
                key
                region
              }
              userType
            }
            type
            calculatedRating
            reviews(filter: { userId: { eq: $id } }) {
              items {
                id
                userId
                user {
                  profilePicture {
                    bucket
                    key
                    region
                  }
                  personFirstName
                  personLastName
                }
                createdAt
                recommendationTags
                rating
                description
                title
              }
            }
          }
        }
      }
      trendingWhiskeys(sortDirection: DESC) {
        items {
          whiskey {
            brand
            id
            name
            age
            picture {
              bucket
              key
              region
            }
            brandPicture {
              bucket
              key
              region
            }
            brandUser {
              id
              brandName
              brandLogo {
                bucket
                key
                region
              }
              userType
            }
            type
            calculatedRating
            reviews(filter: { userId: { eq: $id } }) {
              items {
                rating
              }
            }
          }
        }
      }
      favoriteGuides(sortDirection: DESC) {
        items {
          createdAt
          guides {
            body
            coverPhoto {
              bucket
              key
              region
            }
            createdAt
            id
            photos {
              bucket
              key
              region
            }
            subtitle
            tag
            title
            updatedAt
          }
        }
      }
      followers
      following
      isOnRewards
      deleted
      expoTokens
      brandWhiskeys {
        items {
          id
          name
          brand
          type
          calculatedRating
          picture {
            bucket
            key
            region
          }
          brandPicture {
            bucket
            key
            region
          }
          brandUser {
            id
            brandName
            brandLogo {
              bucket
              key
              region
            }
            userType
          }
        }
      }
      brandVenues {
        items {
          id
          venueName
          profilePicture {
            bucket
            key
            region
          }
        }
      }
    }
  }
`;

export { GetUser };
