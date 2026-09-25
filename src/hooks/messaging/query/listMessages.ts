import { gql } from 'graphql-request';

const ListMessages = gql`
  query MessagesByConversationIdAndCreatedAt(
    $conversationId: ID!
    $sortDirection: ModelSortDirection
    $limit: Int
    $nextToken: String
  ) {
    messagesByConversationIdAndCreatedAt(
      conversationId: $conversationId
      sortDirection: $sortDirection
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        conversationId
        senderId
        text
        readAt
        deletedBySender
        deletedForEveryone
        senderDeleted
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export { ListMessages };
