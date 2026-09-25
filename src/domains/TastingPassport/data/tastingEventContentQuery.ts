import { gql } from 'graphql-request';

/**
 * The three tasting content models allow `public` read, so these run for guests on
 * the API-key client and for members on the token-authed one.
 *
 * Events come back PUBLISHED *and* SCHEDULED: a scheduled row is the one that goes
 * live by the clock at its `publishAt` and stays open for a fixed window, so the app
 * has to hold it before it is due and decide for itself — see `eventWindow`. The
 * status filter runs after the scan, so this pages rather than trusting one `limit`.
 *
 * The filter is a variable rather than a constant so an admin's roster can ask for
 * DRAFT rows too — see `eventStatusFilter`. Everyone else never receives one, which
 * keeps unpublished content off the wire instead of fetching it and hiding it.
 *
 * Booths and pours are read as flat lists rather than through the event's nested
 * `booths { pours }` connections on purpose: those are served by an index keyed on
 * `order`, and a row saved without one is left out of the index entirely — stored,
 * fine in the CMS, invisible to the app. Listed flat, everything comes back. That
 * matters more now that the brand list sorts A→Z: a booth with no `order` is the
 * normal case, not an edge one.
 */
export const LiveTastingEvents = gql`
  query LiveTastingEvents(
    $filter: ModelTastingEventFilterInput
    $nextToken: String
  ) {
    listTastingEvents(filter: $filter, limit: 100, nextToken: $nextToken) {
      items {
        id
        title
        description
        status
        publishAt
        startsAt
        endsAt
        image {
          bucket
          region
          key
        }
        mapImage {
          bucket
          region
          key
        }
        hostBoothNumber
      }
      nextToken
    }
  }
`;

export const TastingBoothsByEvent = gql`
  query TastingBoothsByEvent($eventId: ID!, $nextToken: String) {
    listTastingBooths(
      filter: { eventId: { eq: $eventId } }
      limit: 500
      nextToken: $nextToken
    ) {
      items {
        id
        name
        brandRefId
        location
        boothNumber
        logo {
          bucket
          region
          key
        }
      }
      nextToken
    }
  }
`;

/** Pours carry no event id, so they come whole and are grouped by booth in the app. */
export const TastingPoursPage = gql`
  query TastingPoursPage($nextToken: String) {
    listTastingPours(limit: 1000, nextToken: $nextToken) {
      items {
        id
        boothId
        name
        brand
        tag
        proof
        rating
        bottleKey
        whiskeyRefId
        picture {
          bucket
          region
          key
        }
        order
      }
      nextToken
    }
  }
`;
