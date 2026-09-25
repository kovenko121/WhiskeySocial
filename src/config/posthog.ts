/* eslint-disable @typescript-eslint/naming-convention */
import PostHog from 'posthog-react-native';
import { getAmplifyEnvironment } from './environment';
import { PostHogEventName, PosthogUserIdentityAttributes, PostHogProperties, PostHogJsonValue } from '../types/posthog';
import { removeUndefinedAndNull } from '../utils/common';


export const posthogClient = new PostHog('phc_RZUSQ8DUqrwlZIvjE7po5Ci35xonswG6qRKBgVj3fhU', {
  host: 'https://us.i.posthog.com',
  captureAppLifecycleEvents: true,
  enableSessionReplay: true,
  sessionReplayConfig: {
    maskAllTextInputs: true,
    maskAllImages: false,
    captureLog: true,
    captureNetworkTelemetry: true,
    sampleRate: 1.0,
  },
  disabled: __DEV__,
  enablePersistSessionIdAcrossRestart: true,
  errorTracking: {
    autocapture: {
      uncaughtExceptions: true,
      unhandledRejections: true,
      console: ['error', 'warn'],
    },
  },
});

// Set environment as a default property on all events
posthogClient.register({
  environment: getAmplifyEnvironment(),
});

// Helper to identify user on login/signup.
// Pass isNewUser=true on first signup so the pre-signup anonymous session is
// explicitly aliased to the identified user. This ensures the install→signup
// funnel is preserved even when signup happens in a later session than install.
export const posthogIdentity = (user: PosthogUserIdentityAttributes, isNewUser?: boolean) => {
  const { id, app_version_at_signup, ...properties } = user;

  const phEventProperties: Record<string, any> = { ...properties };

  if (app_version_at_signup) {
    phEventProperties.$set_once = {
      app_version_at_signup
    };
  }

  // Capture the anonymous distinct_id before identify() switches it.
  const anonymousId = isNewUser ? posthogClient.getDistinctId() : null;

  posthogClient.identify(id, phEventProperties);

  // Explicitly link the anonymous session to the identified user. identify()
  // sends $anon_distinct_id automatically, but an explicit alias ensures
  // cross-session linking even if the SDK missed the handoff.
  if (isNewUser && anonymousId && anonymousId !== id) {
    posthogClient.alias(anonymousId);
  }
};

// Helper to register brand group
export const groupPostHogBrand = (brandId: string, brandName?: string | null) => {
  if (!brandId) return;
  const phBrandProperties: Record<string, any> = {};
  if (brandName) {
    phBrandProperties.name = brandName;
  }
  posthogClient.group('brand', brandId, phBrandProperties);
};

// Helper to register venue group
export const groupPostHogVenue = (venueId: string, venueName?: string | null | undefined) => {
  if (!venueId) return;
  const phVenueProperties: Record<string, any> = {};
  if (venueName) {
    phVenueProperties.name = venueName;
  }
  posthogClient.group('venue', venueId, phVenueProperties);
};

// Helper to reset user on logout/account deletion
export const resetPostHogUser = () => {
  posthogClient.reset();
};

export const capturePostHogEvent = (
  eventName: PostHogEventName,
  properties?: PostHogProperties,
  groups?: { brand?: string; venue?: string }
) => {
  const safeProperties = properties
    ? removeUndefinedAndNull(properties) as Record<string, PostHogJsonValue>
    : {};

  // Associate event with brand/venue groups for Group Analytics
  if (groups) {
    const $groups = removeUndefinedAndNull(groups);
    if (Object.keys($groups).length > 0) {
      safeProperties.$groups = $groups;
    }
  }

  posthogClient.capture(eventName, safeProperties);
};
