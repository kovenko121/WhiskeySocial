import { gql } from 'graphql-request';

const UpdateMyCollectionWhiskey = gql`
  mutation UpdateMyCollectionWhiskey(
    $bottleId: ID!
    $age: String
    $batch: String
    $bottle: String
    $proof: Float
    $proofType: ProofType
    $barrel: String
    $rick: String
    $warehouse: String
    $storePick: String
    $singleBarrel: Boolean
    $purchaseYear: String
    $style: String
    $notes: String
  ) {
    updateUserWhiskeys(
      input: {
        id: $bottleId
        barrel: $barrel
        age: $age
        batch: $batch
        bottle: $bottle
        notes: $notes
        proof: $proof
        proofType: $proofType
        rick: $rick
        purchaseYear: $purchaseYear
        style: $style
        storePick: $storePick
        singleBarrel: $singleBarrel
        warehouse: $warehouse
      }
    ) {
      id
    }
  }
`;

export { UpdateMyCollectionWhiskey };
