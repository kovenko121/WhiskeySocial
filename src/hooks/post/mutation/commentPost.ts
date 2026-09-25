import { gql } from 'graphql-request';

const CommentPost = gql`
  mutation commentPost($postId: ID!, $text: String!, $authorId: ID!) {
    createComment(
      input: { postId: $postId, text: $text, authorId: $authorId }
    ) {
      createdAt
      id
      text
      postId
    }
  }
`;

export { CommentPost };
