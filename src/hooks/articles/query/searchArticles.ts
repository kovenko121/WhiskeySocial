import { gql } from 'graphql-request';

const SearchArticles = gql`
  query searchGuides(
    $limit: Int
    $nextToken: String
    $filter: SearchableGuidesFilterInput
  ) {
    searchGuides(
      nextToken: $nextToken
      limit: $limit
      filter: $filter
      sort: { direction: asc, field: title }
    ) {
      nextToken
      items {
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
  }
`;

export { SearchArticles };
