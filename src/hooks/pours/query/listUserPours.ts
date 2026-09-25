import { gql } from 'graphql-request';

const ListUserPours = gql`
  query ListUserPours(
    $limit: Int
    $nextToken: String
    $filter: SearchableUserPoursFilterInput
  ) {
    searchUserPours(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        whiskeyFullName
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

export { ListUserPours };
