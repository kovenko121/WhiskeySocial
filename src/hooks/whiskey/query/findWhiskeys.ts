import { gql } from 'graphql-request';

const FindWhiskeys = gql`
  query FindWhiskeys($lat: Float!, $lon: Float!, $whiskeyId: String!) {
    findWhiskeys(
      input: { byGeoPoint: { lat: $lat, lon: $lon }, byWhiskeyId: $whiskeyId }
    ) {
      total
      items {
        id
        whiskeyId
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

export { FindWhiskeys };
