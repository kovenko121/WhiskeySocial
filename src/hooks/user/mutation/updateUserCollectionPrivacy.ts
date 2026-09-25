import { gql } from 'graphql-request';

const UpdateUserCollectionPrivacy = gql`
  mutation UpdateUserCoverPicture($id: ID!, $isMyCollectionPublic: Boolean) {
    updateUser(input: { id: $id, isMyCollectionPublic: $isMyCollectionPublic }) {
      id
    }
  }
`;

export { UpdateUserCollectionPrivacy };
