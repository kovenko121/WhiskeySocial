import { gql } from 'graphql-request';

const AddWhiskeyToMyCollectionAndReview = gql`
  mutation addWhiskeyToMyBarAndReview(
    $userId: ID!
    $whiskeyId: ID!
    $description: String
    $title: String
    $rating: Int!
    $recommendationTags: [ReviewRecommendationTags]
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
    createReview(
      input: {
        description: $description
        rating: $rating
        title: $title
        userId: $userId
        whiskeyId: $whiskeyId
        recommendationTags: $recommendationTags
        specialistReview: 0
      }
    ) {
      id
    }
  }
`;

export { AddWhiskeyToMyCollectionAndReview };
