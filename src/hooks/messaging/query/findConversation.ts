import { gql } from 'graphql-request';

const FindConversation = gql`
  query ConversationByParticipants(
    $participantKey: String!
    $limit: Int
  ) {
    conversationByParticipants(
      participantKey: $participantKey
      limit: $limit
    ) {
      items {
        id
        participantIds
        lastMessageText
        lastMessageAt
        participants {
          items {
            id
            userId
            requestStatus
            isMuted
            isDeleted
          }
        }
      }
    }
  }
`;

export { FindConversation };
