import { gql } from 'graphql-request';

/**
 * Catalogue lookup by id, shared by the two places holding a whiskey id with no
 * display data attached.
 *
 * Both come from the same root: a pour tapped in Distiller Detail is a `Whiskey`
 * from the brand's catalogue, not a CMS-authored `TastingPour`. So the id
 * recorded in passport state — and copied onto the leaderboard as `bottleKey` —
 * is a Whiskey id, and anything rendering that pour later has to come back here
 * for the name, brand, proof and artwork.
 */
export const SearchWhiskeysByIds = gql`
  query SearchWhiskeysByIds($filter: SearchableWhiskeyFilterInput, $limit: Int) {
    searchWhiskeys(filter: $filter, limit: $limit) {
      items {
        id
        name
        brand
        brandId
        type
        proof
        calculatedRating
        picture {
          bucket
          region
          key
        }
        brandPicture {
          bucket
          region
          key
        }
      }
    }
  }
`;
