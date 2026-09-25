import { gql } from 'graphql-request';

const GetWhiskey = gql`
  query GetWhiskey($id: ID!) {
    getWhiskey(id: $id) {
      id
      fullName
    }
  }
`;

export { GetWhiskey };
