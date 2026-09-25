import { gql } from 'graphql-request';

const SendMessage = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      messageId
      conversationId
      text
      senderId
      createdAt
      isNewConversation
    }
  }
`;

export { SendMessage };
