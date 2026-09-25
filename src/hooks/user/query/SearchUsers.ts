import { gql } from 'graphql-request';

const SearchUsers = gql`
  query searchUsers(
    $nextToken: String
    $limit: Int
    $filter: SearchableUserFilterInput
    $sort: [SearchableUserSortInput]
  ) {
    searchUsers(
      nextToken: $nextToken
      limit: $limit
      filter: $filter
      sort: $sort
    ) {
      nextToken
      items {
        id
        username
        userType
        venueName
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
        brandName
        externalId
        personFirstName
        personLastName
        followers
        venueAddressStreet
        venueAddressNumber
        venueAddressCity
        venueAddressState
        venueCheckinsCount
        deleted
      }
    }
  }
`;

export { SearchUsers };
