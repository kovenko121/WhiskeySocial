import { User } from '../types';
import { getS3Image } from '../helpers';
import { CioIdentityAttributes } from '../types/customerio';
import { getCioLifecycleAttributes } from '../config/customerio';
import { getValueIfDefined, removeUndefinedAndNull } from './common';


export const buildCioIdentity = async (
  userId: string,
  email: string,
  dbUser: User | null | undefined,
  pushTokenSent: boolean,
  finishedOnboarding: boolean = false
): Promise<CioIdentityAttributes> => {
  let expoTokenCount = 0;
  if (typeof dbUser?.expoTokens?.length === 'number') {
    expoTokenCount = dbUser.expoTokens.length;
  } else if (pushTokenSent) {
    expoTokenCount = 1;
  }

  const identity: CioIdentityAttributes = {
    email,
    username: dbUser?.username || undefined,
    user_type: dbUser?.userType || undefined,
    created_at: dbUser?.createdAt
      ? Math.floor(new Date(dbUser.createdAt).getTime() / 1000)
      : undefined,
    // `created_at` is Customer.io's reserved profile-creation field. We also send
    // an explicit `signup_date` (non-reserved) so campaign segments have a stable
    // attribute to key on regardless of how CIO consumes created_at.
    signup_date: dbUser?.createdAt
      ? Math.floor(new Date(dbUser.createdAt).getTime() / 1000)
      : undefined,
    finished_onboarding: finishedOnboarding,
    // last_active is refreshed once per session (this builder runs on the identify
    // that fires on auth-state change, not on every foreground) and again on each
    // check-in via cioRecordCheckIn — the dormancy trigger for the D14/D30 campaigns.
    last_active: Math.floor(Date.now() / 1000),
    deleted: dbUser?.deleted ?? false,
    push_enabled: pushTokenSent || Boolean(dbUser?.expoTokens?.length),
    expo_token_count: expoTokenCount,
    is_collection_public: getValueIfDefined(dbUser?.isMyCollectionPublic, 'boolean'),
    is_on_rewards: getValueIfDefined(dbUser?.isOnRewards, 'boolean'),
    dm_privacy_setting: dbUser?.dmPrivacySetting || undefined,
    external_id: dbUser?.externalId || undefined,
  };

  if (dbUser?.userType === 'PERSON') {
    identity.first_name = dbUser.personFirstName || undefined;
    identity.last_name = dbUser.personLastName || undefined;
    identity.full_name = dbUser.personFullName || undefined;
  } else if (dbUser?.userType === 'VENUE') {
    identity.venue_name = dbUser.venueName || undefined;
    identity.venue_city = dbUser.venueAddressCity || undefined;
    identity.venue_state = dbUser.venueAddressState || undefined;
    identity.venue_country = dbUser.venueAddressCountry || undefined;
    identity.venue_lat = getValueIfDefined(dbUser?.venueAddressGeo?.lat, 'number');
    identity.venue_lon = getValueIfDefined(dbUser?.venueAddressGeo?.lon, 'number');
    identity.venue_rating = getValueIfDefined(dbUser?.venueCalculatedRating, 'number');
    identity.venue_checkin_count = getValueIfDefined(dbUser?.venueCheckinsCount, 'number');
  } else if (dbUser?.userType === 'BRAND') {
    identity.brand_name = dbUser.brandName || undefined;
    identity.brand_country = dbUser.brandCountry || undefined;
    identity.brand_founded_year = getValueIfDefined(dbUser?.brandFoundedYear, 'number');
    identity.brand_website = dbUser.brandWebsite || undefined;

    // S3 fields must be resolved to CDN URLs — never send raw bucket/key/region.
    const logoImage = await getS3Image(dbUser.brandLogo);
    if (logoImage) identity.brand_logo_url = logoImage.uri;
    const coverImage = await getS3Image(dbUser.brandCoverImage);
    if (coverImage) identity.brand_cover_image_url = coverImage.uri;
  }

  // total_check_ins / first_check_in_date come from the device-cached counters
  // (never a per-identify query). first_check_in_date is re-sent as-is, so identify
  // never overwrites the first-write-wins value.
  const lifecycle = await getCioLifecycleAttributes(userId);

  return removeUndefinedAndNull({ ...identity, ...lifecycle });
};
