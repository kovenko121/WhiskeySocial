import { gql } from 'graphql-request';

const CreateReview = gql`
  mutation CreateReview(
    $userId: ID!
    $whiskeyId: ID!
    $description: String
    $title: String
    $rating: Int!
    $recommendationTags: [ReviewRecommendationTags]
  ) {
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

export { CreateReview };
