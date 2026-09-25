import { gql } from 'graphql-request';

const UpdateNotificationSettings = gql`
  mutation UpdateNotificationSettings(
    $id: ID!
    $notificationSettings: [SettingsInput]!
  ) {
    updateUser(
      input: {
        id: $id
        notificationSettings: $notificationSettings
      }
    ) {
      id
    }
  }
`;

export { UpdateNotificationSettings };
