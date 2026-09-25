import { gql } from 'graphql-request';

const CreateVenueRequest = gql`
  mutation CreateVenueRequest(
    $email: String!
    $username: String
    $fullName: String!
    $venueName: String
    $phone: String!
    $street: String
    $city: String
    $state: String
    $number: String
  ) {
    createVenueRequest(
      input: {
        email: $email
        fullName: $fullName
        username: $username
        venueAddressCity: $city
        venueAddressNumber: $number
        venueAddressState: $state
        venueAddressStreet: $street
        venuePhone: $phone
        venueName: $venueName
        status: PENDING
      }
    ) {
      id
    }
  }
`;

export { CreateVenueRequest };
