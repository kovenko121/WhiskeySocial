import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { User, UserType } from '../types';
import { PosthogUserIdentityAttributes } from '../types/posthog';
import { getValueIfDefined, removeUndefinedAndNull } from './common';

export const buildPhIdentity = (
  id: string,
  email: string,
  dbUser: User | null | undefined,
  isSocialLogin: boolean,
  onboardingCompleted: boolean
): PosthogUserIdentityAttributes => {
  const identity: PosthogUserIdentityAttributes = {
    id,
    email: getValueIfDefined(email, 'string'),
    name: getValueIfDefined(dbUser?.username, 'string'),
    // [WHI-155] Emit only the canonical snake_case names. The camelCase duplicates
    // (accountType / isSocialLogin / onboardingCompleted) were dual-written for
    // backward compatibility and split each concept across two PostHog person
    // properties — removed so each concept has exactly one name.
    account_type: getValueIfDefined(dbUser?.userType, 'string'),
    is_social_login: getValueIfDefined(isSocialLogin, 'boolean'),
    onboarding_completed: getValueIfDefined(onboardingCompleted, 'boolean'),
    signup_date: getValueIfDefined(dbUser?.createdAt, 'string'),
    platform: getValueIfDefined(Platform.OS, 'string'),
    app_version_at_signup: getValueIfDefined(Application.nativeApplicationVersion, 'string'),
    ...(dbUser?.userType === UserType.VENUE && {
      zip_code: getValueIfDefined(dbUser?.venueAddressNumber, 'string')
    }),
    // @todo [WHI-8]: first_checkin_date — needs query or $set_once from pour_logged flow (currently set via $set_once on event, not on identify).
    // @todo [WHI-8]: total_checkins — needs aggregation query or cached count; avoid computing on every identify call.
  };

  return removeUndefinedAndNull(identity);
};
