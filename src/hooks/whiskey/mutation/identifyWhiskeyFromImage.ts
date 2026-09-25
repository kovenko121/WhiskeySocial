import { gql } from 'graphql-request';

const IdentifyWhiskeyFromImage = gql`
  mutation IdentifyWhiskeyFromImage($input: IdentifyWhiskeyInput!) {
    identifyWhiskeyFromImage(input: $input) {
      isWhiskeyDetected
      rateLimitExceeded
      error
      message
      extractedInfo {
        brand
        name
        fullLabelText
        age
        proof
        type
        distillery
        origin
        visionConfidence
      }
    }
  }
`;

export { IdentifyWhiskeyFromImage };
