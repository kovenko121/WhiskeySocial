import { gql } from 'graphql-request';

const UpdatePrivacySetting = gql`
  mutation UpdatePrivacySetting($id: ID!, $dmPrivacySetting: DMPrivacySetting!) {
    updateUser(input: { id: $id, dmPrivacySetting: $dmPrivacySetting }) {
      id
      dmPrivacySetting
    }
  }
`;

export { UpdatePrivacySetting };
