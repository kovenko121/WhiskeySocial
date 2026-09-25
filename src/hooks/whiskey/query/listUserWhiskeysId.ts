import { gql } from 'graphql-request';

const ListUserWhiskeysId = gql`
  query ListUserWhiskeysId($userId: ID!, $whiskeyId: ID!) {
    listUserWhiskeys(
      filter: { userId: { eq: $userId }, whiskeyId: { eq: $whiskeyId } }
    ) {
      items {
        id
        archived
      }
    }
  }
`;

export { ListUserWhiskeysId };
