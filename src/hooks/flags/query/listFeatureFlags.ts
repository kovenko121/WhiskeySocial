import { gql } from 'graphql-request';

const ListFeatureFlags = gql`
  query ListFeatureFlags {
    listFeatureFlags {
      items {
        key
        value
        allowedUserIds
      }
    }
  }
`;

export { ListFeatureFlags };
