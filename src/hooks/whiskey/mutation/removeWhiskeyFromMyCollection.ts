import { gql } from 'graphql-request';

const RemoveWhiskeyFromMyCollection = gql`
  mutation DeleteUserWhiskeys($id: ID!) {
    deleteUserWhiskeys(input: { id: $id }) {
      id
      userId
      whiskeyId
    }
  }
`;

export { RemoveWhiskeyFromMyCollection };
