import { gql } from 'graphql-request';

const RemoveGuideFromFavorites = gql`
  mutation RemoveGuideFromFavorites($id: ID!) {
    deleteUserFavoriteGuides(input: {id: $id}) {
      id
      guidesId
      userId
    }
  }
`;

export { RemoveGuideFromFavorites };
