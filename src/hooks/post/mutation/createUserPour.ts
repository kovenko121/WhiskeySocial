import { gql } from 'graphql-request';

const CreateUserPour = gql`
  mutation CreateUserPour(
    $userId: ID!
    $whiskeyId: ID!
    $whiskeyFullName: String
    $count: Int
  ) {
    createUserPours(
      input: {
        userId: $userId
        whiskeyId: $whiskeyId
        whiskeyFullName: $whiskeyFullName
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

export { CreateUserPour };
