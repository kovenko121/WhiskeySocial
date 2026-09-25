import { gql } from 'graphql-request';

const CheckUserPour = gql`
  query CheckUserPour(
    $filter: SearchableUserPoursFilterInput
  ) {
    searchUserPours(filter: $filter, limit: 1) {
      items {
        id
        userId
        whiskeyId
        whiskeyFullName
        count
      }
    }
  }
`;

export { CheckUserPour };
