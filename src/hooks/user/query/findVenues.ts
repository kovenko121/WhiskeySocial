import { gql } from 'graphql-request';

const FindVenues = gql`
  query FindVenues($input: FindVenuesInput!) {
    findVenues(input: $input) {
      total
      nextToken
      items {
        id
        venueName
        username
        userType
        venueAddressGeo {
          lat
          lon
        }
        deleted
        profilePicture {
          bucket
          key
          region
        }
        externalId
        venueAddressCity
        venueAddressStreet
        venueAddressNumber
        venueAddressState
      }
    }
  }
`;

export { FindVenues };
