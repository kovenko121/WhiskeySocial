import { gql } from 'graphql-request';

const GetUserPublic = gql`
  query GetUserPublic($id: ID!) {
    getUser(id: $id) {
      id
      personFirstName
      personLastName
      userType
      username
      bio
      deleted
      toBeRedeemed
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
      brandName
      brandDescription
      brandStory
      brandLogo {
        bucket
        key
        region
      }
      venueName
      venuePhone
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueAddressGeo {
        lat
        lon
      }
      venueWebsite
      venueHours
      venueCheckinsCount
    }
  }
`;

export { GetUserPublic };
