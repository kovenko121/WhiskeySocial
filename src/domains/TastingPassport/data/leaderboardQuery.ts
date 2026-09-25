import { gql } from 'graphql-request';

/**
 * Event-scoped bottle counters, maintained in real time by the
 * `TastingLeaderboardCount` Lambda off the `TastingPourState` stream.
 *
 * Filtered rather than index-queried on purpose: `byEventLeaderboard` was
 * declared without a `queryField`, so no generated query exists for it, and
 * adding one would mean a schema deploy. One row per distinct bottle per event
 * keeps this small enough that a filtered list is the cheaper trade.
 *
 * Read is `private` — signed-in users only.
 */
export const EventLeaderboard = gql`
  query EventLeaderboard($eventId: ID!, $limit: Int, $nextToken: String) {
    listTastingLeaderboardCounters(
      filter: { eventId: { eq: $eventId } }
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        bottleKey
        bottleName
        brand
        count
        updatedAt
      }
      nextToken
    }
  }
`;
