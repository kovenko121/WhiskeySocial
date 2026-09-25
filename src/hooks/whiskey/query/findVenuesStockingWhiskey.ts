import { gql } from 'graphql-request';

const FindVenuesStockingWhiskey = gql`
  query FindVenuesStockingWhiskey(
    $lat: Float!
    $lon: Float!
    $whiskeyId: String!
  ) {
    findVenuesStockingWhiskey(
      input: { byGeoPoint: { lat: $lat, lon: $lon }, byWhiskeyId: $whiskeyId }
    ) {
      total
      nextToken
      items {
        userId
        user {
          id
          venueName
          userType
          venueAddressGeo {
            lat
            lon
          }
          venueAddressStreet
          venueAddressNumber
          venueAddressCity
          venueAddressState
          deleted
          profilePicture {
            bucket
            key
            region
          }
        }
      }
    }
  }
`;

export { FindVenuesStockingWhiskey };
