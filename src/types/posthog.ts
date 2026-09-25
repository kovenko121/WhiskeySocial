export type PosthogUserIdentityAttributes = {
  id: string;
  email?: string;
  name?: string;
  // [WHI-155] Canonical snake_case only. The camelCase duplicates were removed to
  // collapse each concept to a single PostHog person property.
  account_type?: string;
  is_social_login?: boolean;
  onboarding_completed?: boolean;
  signup_date?: string;
  platform?: string;
  app_version_at_signup?: string;
  // @todo [WHI-8]: zip_code — not captured during onboarding; wire once onboarding collects zip or venue profile exposes it.
  zip_code?: string;
  // @todo [WHI-8]: first_checkin_date — needs query or $set_once from pour_created flow (currently set via $set_once on event, not on identify).
  first_checkin_date?: string;
  // @todo [WHI-8]: total_checkins — needs aggregation query or cached count; avoid computing on every identify call.
  total_checkins?: number;
}

export type PostHogGroupName = 'brand' | 'venue'

export type PostHogEventName =
  | 'bottle_rated'
  | 'bottle_added_to_bar'
  | 'pour_created'
  | 'post_created'
  | 'bottle_view'
  | 'search_performed'
  | 'venue_menu_view'
  | 'brand_page_view'
  | 'venue_page_view'
  | 'ad_viewed'
  | 'ad_clicked'
  | 'support_contact_tapped'
  // Activity feed. In-feed ads are excluded; they keep firing `ad_viewed` (WHI-135).
  | 'feed_item_viewed'
  | 'feed_item_tapped'
  // Tasting Passport. Every one of these carries the booth/brand it happened at and the
  // attendee it happened to, so the same stream answers all three reporting cuts:
  // per brand (group `brand`), per bottle (`bottle_key`), and per attendee (`user_id`).
  | 'passport_opened'
  | 'passport_booth_viewed'
  | 'passport_booth_marked'
  | 'passport_pour_tasted'
  | 'passport_pour_favorited'
  | 'passport_lead_opt_in'
  | 'passport_leaderboard_viewed'
  | 'passport_completed'
  // Bottle scan match quality: scores, then what the user did with them (WHI-303).
  | 'bottle_scan_completed'
  | 'bottle_scan_outcome';

export type PostHogJsonValue = string | number | boolean | null | PostHogJsonValue[] | { [key: string]: PostHogJsonValue };
export type PostHogProperties = Record<string, PostHogJsonValue | undefined>;