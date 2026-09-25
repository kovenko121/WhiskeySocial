import { gql } from 'graphql-request';

const CreateUserFavoriteGuides = gql`
  mutation createUserFavoriteGuides(
    $guideId: ID!
    $userId: ID!
    $id: ID!
  ) {
    createUserFavoriteGuides(
      input: {
        id: $id
        guidesId: $guideId
        userId: $userId
      }
    ) {
      id
    }
  }
`;

export { CreateUserFavoriteGuides };
