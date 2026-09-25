/**
 * The event roster exactly as supplied for the mockup — the single source of
 * truth for BOTH the app's sample content (`./fixtures`) and the seed script
 * that writes this event into a real environment
 * (`scripts/seed-tasting-event.ts`).
 *
 * Keep this file free of imports. The seed script runs under plain ts-node with
 * no React Native module resolution, so anything reached from here must be
 * pure data. That constraint is what lets the seeded event and the in-app
 * sample stay identical instead of drifting into two hand-maintained lists.
 */

export const MOCK_EVENT_ID = 'southern-food-whiskey-2026';

export const EVENT_META = {
  name: 'Southern Food & Whiskey Experience',
  dateLabel: 'Sat, Aug 8',
  timeLabel: '6–8pm',
  venue: 'The Factory at Franklin',
};

/**
 * 37 booths in sheet order; undefined brandUserId = no PROD account.
 * Bardstown mapping pending confirm.
 *
 * NOTE: these brand ids are PRODUCTION `User` ids. Seeding this roster into dev
 * will leave the brand links dangling — that is expected, and booths fall back
 * to their own name and logo when the brand cannot be resolved.
 */
export const EVENT_BOOTHS: Array<{ name: string; brandUserId?: string }> = [
  { name: "Angel's Envy", brandUserId: '5ba7397e-1177-4d11-b6e9-97cc9e291584' },
  { name: 'Bardstown Bourbon Co.', brandUserId: '859dded1-293f-49eb-9c0d-043240d0be68' },
  { name: 'Barrell Craft Spirits', brandUserId: 'dfde05a9-5f90-41d8-a80f-1dca51cd4029' },
  { name: 'Belle Meade', brandUserId: 'bd3335af-6925-4cbd-a9a7-c6affbdc6be4' },
  { name: 'Bhakta', brandUserId: 'd50d4b2e-ef39-4865-9611-64aaadb09012' },
  { name: 'Big Machine' },
  { name: 'Blue Run', brandUserId: 'b5157282-8222-49db-a784-345bc911b5b8' },
  { name: 'Bluegrass', brandUserId: '75e7dd54-eced-4b0c-8145-c7b85b6f0c39' },
  { name: 'Cathead' },
  { name: 'Chattanooga', brandUserId: '04a50dec-7dcd-4f21-91b3-0ad039631d8a' },
  { name: 'Chicken Cock', brandUserId: '3bc449cf-4d77-4e14-a6a7-fa1cf157c9a2' },
  { name: 'Clyde Mays', brandUserId: '54c6da7d-d648-474f-a200-f83d43abfda1' },
  { name: 'Dark Arts', brandUserId: 'ea2414aa-fc6f-461e-97db-33d606dc59a5' },
  { name: 'Found North', brandUserId: 'd7c110ab-0120-47cd-87de-1524c3f2cf61' },
  { name: 'Franklin Distillery', brandUserId: '610b5520-0031-70bc-e42f-cd7dd5f3b93a' },
  { name: 'Hard Truth', brandUserId: '0645e3fe-c097-4654-8023-1add52365a5f' },
  { name: 'Heaven Hill', brandUserId: '7beb4dc4-35a7-46a3-a0bd-f05da3bea764' },
  { name: 'Heritage Road', brandUserId: 'c50d27e0-895d-46f9-bfde-ab2f6ee2ea55' },
  { name: 'John Emerald', brandUserId: '1835aec5-7351-4653-a307-555879c06677' },
  { name: 'K. Luke', brandUserId: 'eb6d97de-9622-4598-ab64-5f1389d4817a' },
  { name: 'King Family' },
  { name: 'Larrikin', brandUserId: 'fd9b5266-6ab1-458d-b528-c4eca5f08f9e' },
  { name: "Leiper's Fork", brandUserId: 'dd09b83d-57c1-4037-8c72-3d899ab6a691' },
  { name: 'Logstill' },
  { name: 'Lux Row', brandUserId: '16ccd4bb-ffdf-4fb6-894c-2b827d282f2b' },
  { name: 'Old Elk', brandUserId: '2600d306-f607-44f9-9188-63d0ba2eddd0' },
  { name: 'Old Glory', brandUserId: '32816868-3f37-4b8a-90df-155b8fccac1c' },
  { name: 'Peg Leg Porker', brandUserId: '6d1e9f85-b124-4e97-b37f-329153e78e9e' },
  { name: 'Preservation', brandUserId: 'f1eb45c0-5041-70d7-0fd6-5a46f1a8c44d' },
  { name: 'Pursuit Spirits', brandUserId: '5db05044-cf73-450e-9d2c-16e6bf9ed684' },
  { name: 'Shortbarrel', brandUserId: '85e6f443-12c4-4698-b7a2-402fcb52f304' },
  { name: 'Silverbelly', brandUserId: '96efb984-56dd-4a36-8178-2498bda50c84' },
  { name: 'Southern Collective', brandUserId: 'fb6b5063-8316-4672-9ce6-f7c10e56ba0b' },
  { name: 'Starlight', brandUserId: 'b51d12fe-6b8f-4a58-a0fd-c26f2ef685a0' },
  { name: 'Thirteenth Colony', brandUserId: '5993734b-45a2-4412-86fc-e2a9451607a6' },
  { name: 'Town Branch', brandUserId: '58fc87fc-8a6b-459a-86d5-73a7dfffba0f' },
  { name: 'Whiskey Jypsi', brandUserId: '6949fb7b-cf18-43dc-a921-7bef23c7996e' },
];
