/**
 * Internal feature flags — toggle these booleans to enable/disable integrations.
 * Not driven by environment variables or remote config.
 */
export const featureFlags = {
  /** Sentry error monitoring, session replay, and navigation breadcrumbs */
  sentry: false,
} as const;
