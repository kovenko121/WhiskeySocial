import { gql } from 'graphql-request';

const GetPost = gql`
  query GetPost($id: ID!) {
    getPost(id: $id) {
      id
      photoModerationStatus
      authorId
      clubId
      photo {
        bucket
        key
        region
        width
        height
      }
      createdAt
      updatedAt
    }
  }
`;

export { GetPost };