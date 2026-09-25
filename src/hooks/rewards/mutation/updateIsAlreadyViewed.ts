import { gql } from 'graphql-request';

const UpdateIsAlreadyViewed = gql`
  mutation UpdateIsAlreadyViewed($id: ID!, $isAlreadyViewed: Boolean) {
    updateUserReward(input: { id: $id, isAlreadyViewed: $isAlreadyViewed }) {
      isAlreadyViewed
    }
  }
`;

export { UpdateIsAlreadyViewed };
