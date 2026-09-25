import { gql } from 'graphql-request';

const ListAppConfigs = gql`
  query ListAppConfigs {
    listAppConfigs {
      items {
        key
        value
      }
    }
  }
`;

export { ListAppConfigs };
