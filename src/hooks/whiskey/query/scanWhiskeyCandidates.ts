import { gql } from 'graphql-request';

const ScanWhiskeyCandidates = gql`
  query ScanWhiskeyCandidates($limit: Int, $filter: SearchableWhiskeyFilterInput) {
    searchWhiskeys(limit: $limit, filter: $filter) {
      items {
        id
        age
        name
        fullName
        type
        proof
        proofType
        picture {
          bucket
          key
          region
        }
        brandId
        brand
        brandPicture {
          bucket
          key
          region
        }
        calculatedRating
        singleBarrel
      }
    }
  }
`;

export { ScanWhiskeyCandidates };
