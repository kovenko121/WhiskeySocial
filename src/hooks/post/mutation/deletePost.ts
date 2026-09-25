import { gql } from 'graphql-request';

const DeletePost = gql`
  mutation DeletePost($id: ID!) {
    deletePost(input: { id: $id }) {
      authorId
      id
    }
  }
`;

export { DeletePost };
