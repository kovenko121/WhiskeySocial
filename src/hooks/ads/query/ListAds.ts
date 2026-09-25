import { gql } from 'graphql-request';

const ListAds = gql`
  query ListAds($type: AdType!) {
    adCampaignsByType(type: $type) {
      items {
        id
        name
        owner
        picture {
          bucket
          key
          region
        }
        type
        url
        updatedAt
        startDate
        isActive
        endDate
        createdAt
      }
    }
  }
`;

export { ListAds };
