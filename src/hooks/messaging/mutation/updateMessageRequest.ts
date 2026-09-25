import { gql } from 'graphql-request';

const UpdateMessageRequest = gql`
  mutation UpdateMessageRequest($input: UpdateMessageRequestInput!) {
    updateMessageRequest(input: $input) {
      success
      participantId
      conversationId
      requestStatus
    }
  }
`;

export { UpdateMessageRequest };
