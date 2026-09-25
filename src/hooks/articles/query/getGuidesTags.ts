import { gql } from 'graphql-request';

const GetGuidesTags = gql`
  query GetGuidesTags {
    listGuideTags(filter: { count: { ge: 1 } }) {
      items {
        name
        id
      }
    }
  }
`;

export { GetGuidesTags };
