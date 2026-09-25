import { gql } from 'graphql-request';

const DeleteScanImage = gql`
  mutation DeleteScanImage($input: DeleteScanImageInput!) {
    deleteScanImage(input: $input) {
      success
      error
    }
  }
`;

export { DeleteScanImage };
