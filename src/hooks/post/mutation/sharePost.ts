import { gql } from 'graphql-request';

const SharePost = gql`
  mutation SharePost(
    $sharedPostId: ID!
    $authorId: ID!
    $shareComment: String
    $clubId: ID
    $clubIsPrivate: Boolean
  ) {
    createPost(
      input: {
        sharedPostId: $sharedPostId
        authorId: $authorId
        shareComment: $shareComment
        clubId: $clubId
        clubIsPrivate: $clubIsPrivate
        likesCount: 0
        sharesCount: 0
      }
    ) {
      id
      sharedPostId
      shareComment
      authorId
      clubId
      clubIsPrivate
      likesCount
      sharesCount
      createdAt
      updatedAt
      owner
    }
  }
`;

export { SharePost };
