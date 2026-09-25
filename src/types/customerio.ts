export type CioIdentityAttributes = {
  email?: string;
  username?: string;
  user_type?: string;
  created_at?: number;
  deleted?: boolean;
  push_enabled?: boolean;
  expo_token_count?: number;
  dm_privacy_setting?: string;
  is_collection_public?: boolean;
  is_on_rewards?: boolean;
  external_id?: string;
  // Lifecycle (WHI-159) — behavioral attributes the Sprint 5 CIO campaigns segment on.
  last_active?: number; // unix seconds; dormancy trigger (WHI-88 D14 / WHI-89 D30)
  total_check_ins?: number; // device-cached activation + ladder counter
  first_check_in_date?: number; // unix seconds; first-write-wins activation milestone
  finished_onboarding?: boolean; // splits "signed up, didn't activate"
  signup_date?: number; // unix seconds; explicit non-reserved mirror of created_at
  // PERSON
  first_name?: string;
  last_name?: string;
  full_name?: string;
  // VENUE
  venue_name?: string;
  venue_city?: string;
  venue_state?: string;
  venue_country?: string;
  venue_lat?: number;
  venue_lon?: number;
  venue_rating?: number;
  venue_checkin_count?: number;
  // BRAND
  brand_name?: string;
  brand_country?: string;
  brand_founded_year?: number;
  brand_website?: string;
  brand_logo_url?: string;
  brand_cover_image_url?: string;
};

// `pour_created` is the canonical activation event (WHI-284, renamed from
// `pour_logged`). It must match the PostHog event name exactly or cohort→segment
// sync breaks (WHI-158).
export type CioEventName = 'app_open' | 'app_close' | 'pour_created' | 'like' | 'follow' | 'reward_redeemed' | 'profile_updated' | 'push_notification_received' | 'push_notification_opened';

export type CioEventData = {
  [key: string]: string | number | boolean | null | undefined | string[];
};