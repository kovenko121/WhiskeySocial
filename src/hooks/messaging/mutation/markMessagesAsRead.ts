import { gql } from 'graphql-request';

const MarkMessagesAsRead = gql`
  mutation MarkMessagesAsRead($input: MarkMessagesAsReadInput!) {
    markMessagesAsRead(input: $input) {
      success
      conversationId
      readAt
      updatedMessageCount
    }
  }
`;

export { MarkMessagesAsRead };
