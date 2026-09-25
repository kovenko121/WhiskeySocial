import { gql } from 'graphql-request';

const DeleteWhiskeyFromWishlist = gql`
  mutation DeleteWhiskeyFromWishlist($id: ID!) {
    deleteUserWishListWhiskeys(input: { id: $id }) {
      id
      whiskeyId
      userId
    }
  }
`;

export { DeleteWhiskeyFromWishlist };
