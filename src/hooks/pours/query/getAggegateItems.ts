import { gql } from 'graphql-request';

const GetAggregateItems = gql`
  query GetAggregateItems($filter: SearchableUserPoursFilterInput) {
    searchUserPours(
      filter: $filter
      aggregates: { field: whiskeyId, type: terms, name: "name" }
    ) {
      aggregateItems {
        result {
          ... on SearchableAggregateBucketResult {
            buckets {
              doc_count
              key
            }
          }
        }
      }
    }
  }
`;

export { GetAggregateItems };
