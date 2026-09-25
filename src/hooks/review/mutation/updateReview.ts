import { gql } from 'graphql-request';

const UpdateReview = gql`
  mutation UpdateReview(
    $id: ID!
    $rating: Int
    $title: String
    $description: String
    $recommendationTags: [ReviewRecommendationTags]
    $specialistReview: Int
  ) {
    updateReview(
      input: {
        id: $id
        rating: $rating
        title: $title
        description: $description
        recommendationTags: $recommendationTags
        specialistReview: $specialistReview
      }
    ) {
      id
    }
  }
`;

export { UpdateReview };
