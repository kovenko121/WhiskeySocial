import { gql } from 'graphql-request';

const FollowUser = gql`
  mutation FollowUser(
    $id: ID!
  ) {
      followUser(user: $id)
  }
`;

export { FollowUser };
