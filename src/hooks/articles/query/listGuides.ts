import { gql } from 'graphql-request';

const ListGuides  = gql`
  query ListGuides($limit: Int, $filter: ModelGuidesFilterInput) {
    listGuides(
      limit: $limit
      filter: $filter
    ) {
      items {
        body
        coverPhoto {
          bucket
          key
          region
        }
        createdAt
        id
        photos {
          bucket
          key
          region
        }
        subtitle
        tag
        title
      }
    }
  }
`;

export { ListGuides };
