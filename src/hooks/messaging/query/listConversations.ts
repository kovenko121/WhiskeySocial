import { gql } from 'graphql-request';

const ListConversations = gql`
  query ConversationParticipantsByUser(
    $userId: ID!
    $limit: Int
    $nextToken: String
    $filter: ModelConversationParticipantFilterInput
  ) {
    conversationParticipantsByUserIdAndConversationId(
      userId: $userId
      limit: $limit
      nextToken: $nextToken
      filter: $filter
    ) {
      items {
        id
        conversationId
        userId
        unreadCount
        lastReadAt
        isMuted
        isDeleted
        requestStatus
        conversation {
          id
          participantIds
          lastMessageText
          lastMessageSenderId
          lastMessageAt
          participants {
            items {
              userId
              user {
                id
                username
                profilePicture {
                  bucket
                  key
                  region
                }
                deleted
              }
            }
          }
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export { ListConversations };
