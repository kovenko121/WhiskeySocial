import { gql } from 'graphql-request';

const ListPostComments = gql`
  query ListComments($nextToken: String, $postId: ID!) {
    commentsByPostId(postId: $postId, nextToken: $nextToken) {
      nextToken
      items {
        createdAt
        id
        owner
        text
        authorId
        post {
          authorId
        }
        author {
          id
          personFirstName
          personLastName
          profilePicture {
            key
            region
            bucket
          }
          username
        }
        postId
      }
    }
  }
`;

export { ListPostComments };
