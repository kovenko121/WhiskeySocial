import { gql } from 'graphql-request';

const UpdateSecuritySettings = gql`
  mutation UpdateSecuritySettings(
    $id: ID!
    $securitySettings: [SettingsInput]!
  ) {
    updateUser(
      input: {
        id: $id
        securitySettings: $securitySettings
      }
    ) {
      id
    }
  }
`;

export { UpdateSecuritySettings };
