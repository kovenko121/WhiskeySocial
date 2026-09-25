import { gql } from 'graphql-request';

const AddWhiskeyToWishList = gql`
  mutation AddWhiskeyToWishList($userId: ID!, $whiskeyId: ID!, $id:ID!) {
    createUserWishListWhiskeys(
      input: { id: $id, userId: $userId, whiskeyId: $whiskeyId }
    ) {
      createdAt
      whiskeyId
      userId
      id
    }
  }
`;

export { AddWhiskeyToWishList };
