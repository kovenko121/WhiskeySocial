import { gql } from 'graphql-request';

const SetUserIsOnRewards = gql`
  mutation SetUserIsOnRewards {
    setUserIsOnRewards
  }
`;

export { SetUserIsOnRewards };
