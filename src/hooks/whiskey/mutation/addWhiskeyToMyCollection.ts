import { gql } from 'graphql-request';

const AddWhiskeyToMyCollection = gql`
  mutation AddWhiskeyToMyBar(
    $userId: ID!
    $whiskeyId: ID!
    $geo: GeoPointInput
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
    createUserWhiskeys(
      input: {
        userId: $userId
        whiskeyId: $whiskeyId
        geo: $geo
        age: $age
        batch: $batch
        bottle: $bottle
        proof: $proof
        proofType: $proofType
        barrel: $barrel
        rick: $rick
        warehouse: $warehouse
        storePick: $storePick
        singleBarrel: $singleBarrel
        purchaseYear: $purchaseYear
        style: $style
        notes: $notes
      }
    ) {
      id
    }
  }
`;

export { AddWhiskeyToMyCollection };
