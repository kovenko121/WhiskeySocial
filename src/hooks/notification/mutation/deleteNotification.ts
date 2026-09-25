import { gql } from 'graphql-request';

const DeleteNotification = gql`
  mutation deleteNotification($id: ID!) {
    deleteNotification(input: { id: $id }) {
      id
    }
  }
`;

export { DeleteNotification };
