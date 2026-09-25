import { gql } from 'graphql-request';

const UnfollowUser = gql`
  mutation UnfollowUser(
    $id: ID!
  ) {
      unfollowUser(user: $id)
  }
`;

export { UnfollowUser };
