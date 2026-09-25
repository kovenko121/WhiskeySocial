import { gql } from 'graphql-request';

const SearchUserPours = gql`
  query SearchUserPours(
    $limit: Int
    $nextToken: String
    $filter: SearchableUserPoursFilterInput
    $sort: [SearchableUserPoursSortInput]
  ) {
    searchUserPours(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        count
        createdAt
        whiskey {
          name
          brand
          id
          picture {
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
      nextToken
    }
  }
`;

export { SearchUserPours };
