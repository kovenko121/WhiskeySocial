import { gql } from 'graphql-request';

const SoftDeleteMessage = gql`
  mutation SoftDeleteMessage($input: SoftDeleteMessageInput!) {
    softDeleteMessage(input: $input) {
      success
      messageId
      conversationId
      deleteForEveryone
    }
  }
`;

export { SoftDeleteMessage };
