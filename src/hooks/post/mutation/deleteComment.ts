import { gql } from 'graphql-request';

const DeleteComment = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(input: { id: $id }) {
      authorId
      id
    }
  }
`;

export { DeleteComment };
