import { gql } from 'graphql-request';

const GetWhiskey = gql`
  query GetWhiskey($id: ID!, $userId: ID!) {
    getWhiskey(id: $id) {
      id
      name
      description
      distillery
      type
      specialistChoice
      starterPick
      singleBarrel
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
        userType
        brandName
        brandLogo {
          bucket
          key
          region
        }
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
    reviewsByWhiskeyIdAndSpecialistReviewAndRating(
      whiskeyId: $id
      sortDirection: DESC
    ) {
      nextToken
      items {
        id
        title
        description
        rating
        createdAt
        recommendationTags
        userId
        specialistReview
        specialistName
        specialistImage {
          bucket
          key
          region
        }
        user {
          profilePicture {
            bucket
            key
            region
          }
          personFirstName
          personLastName
        }
      }
    }
  }
`;

export { GetWhiskey };
