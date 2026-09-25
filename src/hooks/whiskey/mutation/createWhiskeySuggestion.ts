import { gql } from 'graphql-request';

const CreateWhiskeySuggestion = gql`
  mutation CreateWhiskeySuggestion(
    $barcode: String
    $brand: String!
    $name: String!
    $year: String
    $photo: S3ObjectInput!
    $userId: String!
  ) {
    createSuggestion(
      input: {
        barcode: $barcode
        brand: $brand
        name: $name
        year: $year
        photo: $photo
        userId: $userId
      }
    ) {
      id
    }
  }
`;

export { CreateWhiskeySuggestion };
