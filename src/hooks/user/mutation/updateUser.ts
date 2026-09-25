import { gql } from 'graphql-request';

const UpdateUser = gql`
  mutation UpdateUser(
    $id: ID!
    $username: String
    $firstName: String
    $lastName: String
    $fullName: String
    $profilePicture: S3ObjectInput
    $profilePictureKey: String
    $profilePictureModerationStatus: ModerationStatus
    $bio: String
    $venueName: String
    $venueSearchName: String
    $venueWebsite: String
    $venueHours: String
    $phone: String
    $street: String
    $city: String
    $state: String
    $number: String
    $geoPoint: GeoPointInput
  ) {
    updateUser(
      input: {
        id: $id
        username: $username
        personFirstName: $firstName
        personLastName: $lastName
        personFullName: $fullName
        profilePicture: $profilePicture
        profilePictureKey: $profilePictureKey
        profilePictureModerationStatus: $profilePictureModerationStatus
        bio: $bio
        venueName: $venueName
        venueSearchName: $venueSearchName
        venueWebsite: $venueWebsite
        venueHours: $venueHours
        venuePhone: $phone
        venueAddressStreet: $street
        venueAddressCity: $city
        venueAddressState: $state
        venueAddressNumber: $number
        venueAddressGeo: $geoPoint
      }
    ) {
      id
    }
  }
`;

export { UpdateUser };
