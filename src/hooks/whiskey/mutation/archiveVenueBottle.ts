import { gql } from 'graphql-request';

const ArchiveVenueBottle = gql`
  mutation ArchiveVenueBottle($bottleId: ID!, $archived: Boolean!) {
    updateUserWhiskeys(input: { id: $bottleId, archived: $archived }) {
      id
      archived
    }
  }
`;

export { ArchiveVenueBottle };
