import { gql } from 'graphql-request';

const UpdateUserPour = gql`
  mutation UpdateUserPour(
    $id: ID!
    $count: Int!
  ) {
    updateUserPours(
      input: {
        id: $id
        count: $count
      }
    ) {
      id
      userId
      whiskeyId
      whiskeyFullName
      count
      createdAt
      updatedAt
    }
  }
`;

export { UpdateUserPour };
