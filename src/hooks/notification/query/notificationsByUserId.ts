import { gql } from 'graphql-request';

const NotificationsByUserId = gql`
  query NotificationsByUserId($id: ID!) {
    notificationsByUserIdAndCreatedAt(userId: $id, sortDirection: DESC) {
      items {
        id
        message
        createdAt
        link
        type
        relatedUser {
          profilePicture {
            key
            bucket
            region
          }
        }
        secondaryPicture {
          key
          bucket
          region
        }
      }
    }
  }
`;

export { NotificationsByUserId };
