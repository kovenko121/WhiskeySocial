import { gql } from 'graphql-request';

const GetGuide = gql`
  query GetGuide($id: ID!) {
    getGuides(id: $id) {
      id
      body
      coverPhoto {
        bucket
        key
        region
      }
      createdAt
      photos {
        bucket
        key
        region
      }
      subtitle
      tag
      title
      updatedAt
    }
  }
`;

export { GetGuide };
