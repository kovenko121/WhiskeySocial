import { gql } from 'graphql-request';

const StarterPicks = gql`
  query StarterPicks($id: ID!, $nextToken: String) {
    searchWhiskeys(
      filter: { starterPick: { eq: true } }
      limit: 10
      nextToken: $nextToken
    ) {
      nextToken
      items {
        id
        age
        name
        type
        picture {
          bucket
          key
          region
        }
        brandId
        brandUser {
          id
          brandName
          brandSearchName
          brandDescription
          brandLogo {
            bucket
            key
            region
          }
          brandCoverImage {
            bucket
            key
            region
          }
          brandWebsite
          brandCountry
          brandFoundedYear
          brandStory
          userType
          username
          profilePicture {
            bucket
            key
            region
          }
          coverPicture {
            bucket
            key
            region
          }
          bio
        }
        brand
        brandPicture {
          bucket
          key
          region
        }
        calculatedRating
        reviews(filter: { userId: { eq: $id } }) {
          items {
            rating
          }
        }
      }
    }
  }
`;

export { StarterPicks };
