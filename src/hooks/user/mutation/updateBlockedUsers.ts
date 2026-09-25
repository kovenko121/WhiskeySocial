import { gql } from 'graphql-request';

const UpdateBlockedUsers = gql`
  mutation UpdateBlockedUsers($id: ID!, $blockedUsers: [String]) {
    updateUser(input: { id: $id, blockedUsers: $blockedUsers }) {
      id
    }
  }
`;

export { UpdateBlockedUsers };
