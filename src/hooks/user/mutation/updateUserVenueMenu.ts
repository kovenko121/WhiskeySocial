import { gql } from 'graphql-request';

const UpdateUserVenueMenu = gql`
  mutation UpdateUserVenueMenu($id: ID!, $venueMenu: S3ObjectInput) {
    updateUser(input: { id: $id, venueMenu: $venueMenu }) {
      id
    }
  }
`;

export { UpdateUserVenueMenu };
