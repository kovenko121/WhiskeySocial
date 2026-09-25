import { gql } from 'graphql-request';

const UpdateConversationParticipant = gql`
  mutation UpdateConversationParticipant(
    $input: UpdateConversationParticipantInput!
  ) {
    updateConversationParticipant(input: $input) {
      id
      conversationId
      userId
      isMuted
      isDeleted
      updatedAt
    }
  }
`;

export { UpdateConversationParticipant };
