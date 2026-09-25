import { gql } from 'graphql-request';

const GetUserBottle = gql`
  query GetUserBottle($bottleId: ID!, $userId: ID!) {
    getUserWhiskeys(id: $bottleId) {
      id
      barrel
      batch
      bottle
      notes
      proof
      proofType
      rick
      storePick
      singleBarrel
      purchaseYear
      warehouse
      age
      style
      whiskey {
        id
        name
        description
        distillery
        type
        specialistChoice
        starterPick
        origin
        proof
        proofType
        picture {
          bucket
          key
          region
        }
        brand
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
        age
        calculatedRating
        distilleryTastingNotes
        reviews(filter: { userId: { eq: $userId } }) {
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
        awards {
          title
          year
          picture {
            bucket
            key
            region
          }
        }
        users {
          items {
            user {
              venueName
              venueCalculatedRating
              profilePicture {
                bucket
                key
                region
              }
            }
          }
        }
      }
    }
  }
`;

export { GetUserBottle };
