import { gql } from 'graphql-request';

const SearchEntitiesForTag = gql`
  query SearchEntitiesForTag(
    $filter: SearchableUserFilterInput
    $limit: Int
    $sort: [SearchableUserSortInput]
    $nextToken: String
  ) {
    users: searchUsers(
      filter: $filter
      limit: $limit
      sort: $sort
      nextToken: $nextToken
    ) {
      items {
        id
        username
        userType
        personFirstName
        personLastName
        personFullName
        venueName
        venueSearchName
        brandName
        brandSearchName
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
        venueAddressStreet
        venueAddressNumber
        venueAddressCity
        venueAddressState
        followers
        following
        deleted
      }
      nextToken
    }
  }
`;

export { SearchEntitiesForTag };
