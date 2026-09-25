export type NudgeIntent =
  | 'pour_log'
  | 'follow'
  | 'collection_save'
  | 'tasting_event'
  | 'default';

export const NUDGE_COPY: Record<NudgeIntent, { headline: string; subhead: string; cta: string }> = {
  pour_log: {
    headline: 'Start your shelf.',
    subhead: "Log this pour and build a record of everything you've tasted.",
    cta: 'Create free account',
  },
  follow: {
    headline: 'Follow along.',
    subhead: 'Create an account to follow this person and see their pours.',
    cta: 'Create free account',
  },
  collection_save: {
    headline: 'Build your want list.',
    subhead: 'Save bottles to a collection you can come back to.',
    cta: 'Create free account',
  },
  tasting_event: {
    headline: 'Get your passport.',
    subhead:
      'Create a free account to stamp every booth and keep the pours you taste tonight.',
    cta: 'Create free account',
  },
  default: {
    headline: 'Start your shelf.',
    subhead: "Track what you've tasted. Find what to try next.",
    cta: 'Create free account',
  },
};
