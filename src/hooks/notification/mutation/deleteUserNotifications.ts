import { gql } from 'graphql-request';

const DeleteUserNotifications = gql`
  mutation deleteUserNotifications {
    deleteUserNotifications
  }
`;

export { DeleteUserNotifications };
