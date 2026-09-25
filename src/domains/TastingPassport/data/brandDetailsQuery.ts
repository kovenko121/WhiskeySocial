import { gql } from 'graphql-request';

export const SearchPassportBrands = gql`
  query searchUsers($nextToken: String, $limit: Int, $filter: SearchableUserFilterInput) {
    searchUsers(nextToken: $nextToken, limit: $limit, filter: $filter) {
      nextToken
      items {
        id
        brandName
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
        brandDescription
        brandStory
        brandWebsite
        brandCountry
        brandFoundedYear
      }
    }
  }
`;
