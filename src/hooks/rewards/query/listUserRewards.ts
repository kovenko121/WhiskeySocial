import { gql } from 'graphql-request';

const ListUserRewards = gql`
  query ListUserRewards {
    listUserRewards(limit: 10000) {
      items {
        trackingCode
        service
        address
        city
        email
        fullName
        id
        isRedeemed
        model
        size
        state
        zipcode
        isRedeemed
        isCompleted
        isAlreadyViewed
        reward {
          models
          sizes
          title
          isAvailable
          photo {
            bucket
            key
            region
          }
          description
          conditions {
            key
            value
          }
        }
        score
        id
      }
    }
  }
`;

export { ListUserRewards };
