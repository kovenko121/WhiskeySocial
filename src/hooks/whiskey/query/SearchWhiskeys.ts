import { gql } from 'graphql-request';

const SearchWhiskeys = gql`
  query SearchWhiskeys(
    $limit: Int
    $nextToken: String
    $filter: SearchableWhiskeyFilterInput
  ) {
    searchWhiskeys(
      nextToken: $nextToken
      limit: $limit
      filter: $filter
      sort: { field: fullName, direction: asc }
    ) {
      nextToken
      items {
        id
        age
        name
        fullName
        type
        proof
        proofType
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
        distilleryTastingNotes
        singleBarrel
      }
    }
  }
`;

export { SearchWhiskeys };
