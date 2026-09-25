import { gql } from 'graphql-request';

/**
 * Hand-written operations for the passport's per-attendee state models. These
 * match the Amplify-generated CRUD for `TastingBoothState` / `TastingPourState`
 * / `TastingUserPref` (all owner-auth) and the content/leaderboard reads. Kept
 * colocated rather than pulled from `src/graphql` so the passport module owns
 * its own minimal selection sets.
 */

// --- per-attendee booth state (owner-scoped) ---
export const CreateTastingBoothState = gql`
  mutation CreateTastingBoothState($input: CreateTastingBoothStateInput!) {
    createTastingBoothState(input: $input) {
      id
    }
  }
`;

export const UpdateTastingBoothState = gql`
  mutation UpdateTastingBoothState($input: UpdateTastingBoothStateInput!) {
    updateTastingBoothState(input: $input) {
      id
    }
  }
`;

export const ListTastingBoothStates = gql`
  query ListTastingBoothStates($filter: ModelTastingBoothStateFilterInput, $nextToken: String) {
    listTastingBoothStates(filter: $filter, limit: 1000, nextToken: $nextToken) {
      items {
        id
        eventId
        boothId
        want
        went
        fav
        notes
        shareEmail
      }
      nextToken
    }
  }
`;

// --- per-attendee pour state (owner-scoped) ---
export const CreateTastingPourState = gql`
  mutation CreateTastingPourState($input: CreateTastingPourStateInput!) {
    createTastingPourState(input: $input) {
      id
    }
  }
`;

export const UpdateTastingPourState = gql`
  mutation UpdateTastingPourState($input: UpdateTastingPourStateInput!) {
    updateTastingPourState(input: $input) {
      id
    }
  }
`;

export const ListTastingPourStates = gql`
  query ListTastingPourStates($filter: ModelTastingPourStateFilterInput, $nextToken: String) {
    listTastingPourStates(filter: $filter, limit: 1000, nextToken: $nextToken) {
      items {
        id
        eventId
        boothId
        pourId
        bottleKey
        tasted
        fav
      }
      nextToken
    }
  }
`;

// --- per-attendee event header + lead contact snapshot (owner-scoped) ---
export const GetTastingAttendance = gql`
  query GetTastingAttendance($id: ID!) {
    getTastingAttendance(id: $id) {
      id
      shareContact
      displayName
      email
    }
  }
`;

export const CreateTastingAttendance = gql`
  mutation CreateTastingAttendance($input: CreateTastingAttendanceInput!) {
    createTastingAttendance(input: $input) {
      id
    }
  }
`;

export const UpdateTastingAttendance = gql`
  mutation UpdateTastingAttendance($input: UpdateTastingAttendanceInput!) {
    updateTastingAttendance(input: $input) {
      id
    }
  }
`;

// --- onboarding pref (owner-scoped, one row per user, id == user sub) ---
export const GetTastingUserPref = gql`
  query GetTastingUserPref($id: ID!) {
    getTastingUserPref(id: $id) {
      id
      onboardedAt
    }
  }
`;

export const CreateTastingUserPref = gql`
  mutation CreateTastingUserPref($input: CreateTastingUserPrefInput!) {
    createTastingUserPref(input: $input) {
      id
    }
  }
`;

export const UpdateTastingUserPref = gql`
  mutation UpdateTastingUserPref($input: UpdateTastingUserPrefInput!) {
    updateTastingUserPref(input: $input) {
      id
    }
  }
`;
