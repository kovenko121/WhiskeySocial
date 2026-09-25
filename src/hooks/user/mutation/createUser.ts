import { gql } from 'graphql-request';

const CreateUser = gql`
  mutation CreateUser(
    $id: ID!
    $username: String!
    $userType: UserType!
    $firstName: String
    $lastName: String
    $venueName: String
    $phone: String
    $street: String
    $city: String
    $state: String
    $number: String
    $geoPoint: GeoPointInput
    $venueMenu: S3ObjectInput
  ) {
    createUser(
      id: $id
      username: $username
      userType: $userType
      firstName: $firstName
      lastName: $lastName
      venueName: $venueName
      phone: $phone
      street: $street
      city: $city
      state: $state
      number: $number
      geoPoint: $geoPoint
      venueMenu: $venueMenu
    )
  }
`;

export { CreateUser };
