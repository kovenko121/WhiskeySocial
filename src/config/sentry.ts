/* eslint-disable no-param-reassign -- Sentry's beforeSend/beforeBreadcrumb hooks
   scrub PII by mutating the event and breadcrumb they are handed; returning a copy
   is not part of that contract. */
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get AppSync/API Gateway endpoint from aws-exports for trace propagation
import awsconfig from './aws';
import { getAmplifyEnvironment } from './environment';
import { featureFlags } from './featureFlags';

// Extract domain from AppSync endpoint for trace propagation
const getApiDomain = (endpoint: string): RegExp => {
  try {
    const url = new URL(endpoint);
    // Match the full domain for AppSync
    return new RegExp(url.hostname.replace(/\./g, '\\.'));
  } catch {
    return /appsync.*\.amazonaws\.com/;
  }
};


export const initSentry = () => {
  if (!featureFlags.sentry) return;

  const dsn = Constants.expoConfig?.extra?.SENTRY_DSN || process.env.EXPO_PUBLIC_SENTRY_DSN;

  // Skip Sentry initialization if no DSN is configured
  if (!dsn) return;

  Sentry.init({
    dsn,

    // Environment detection - automatically derived from Amplify environment
    environment: getAmplifyEnvironment(),

    // Enable Sentry in all environments including development
    // To disable in dev, change to: enabled: !__DEV__,
    enabled: process.env.EXPO_PUBLIC_APP_ENV !== 'development',

    // Enable debug logs in dev only
    debug: __DEV__,

    // Add tags to identify this is the mobile app
    initialScope: {
      tags: {
        platform: 'mobile-app',
        app: 'whiskey-social-mobile',
        os: Platform.OS, // 'ios' or 'android'
        'os.version': Platform.Version,
      },
    },

    // Integrations
    integrations: [
      Sentry.reactNativeTracingIntegration(),
      // Mobile Replay for session recording
      Sentry.mobileReplayIntegration({
        maskAllText: false,
        maskAllImages: true,
      }),
      // OPTIONAL: Capture console logs as breadcrumbs (uncomment if needed)
      // Sentry.captureConsoleIntegration({
      //   levels: ['error', 'warn'], // Only capture errors and warnings, not log/debug/info
      // }),
    ],

    // Enable trace propagation for distributed tracing
    tracePropagationTargets: [
      getApiDomain(awsconfig.aws_appsync_graphqlEndpoint),
      /api\.whiskeysocial\.app/,
      /amazonaws\.com/,
    ],

    // Dynamic sampling based on context
    tracesSampler: (samplingContext) => {
      // Don't sample in development
      if (__DEV__) return 0;

      const txName = samplingContext.transactionContext?.name || '';

      // Sample auth flows at higher rate
      if (txName.includes('Auth') || txName.includes('Login')) return 0.2;

      // Sample whiskey operations at higher rate (core feature)
      if (txName.includes('Whiskey') || txName.includes('Bottle')) return 0.15;

      // Default production sampling
      return 0.1;
    },

    // Start profiling at 0% in production (can increase later)
    profilesSampleRate: __DEV__ ? 1.0 : 0,

    // Session Replay sampling
    replaysSessionSampleRate: __DEV__ ? 1.0 : 0.1,
    replaysOnErrorSampleRate: 1.0, // Always capture replays on errors

    // Enable auto session tracking for release health
    enableAutoSessionTracking: true,

    // Enable native crash reporting
    enableNativeCrashHandling: true,

    // Max breadcrumbs to keep
    maxBreadcrumbs: 100,

    // CRITICAL: Don't send PII by default
    sendDefaultPii: false,

    // BeforeSend: Scrub sensitive data and filter errors
    beforeSend(event, hint) {
      // Scrub sensitive headers
      if (event.request && event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.Authorization;
        delete event.request.headers.cookie;
        delete event.request.headers.Cookie;

        // Remove AWS-specific headers
        Object.keys(event.request.headers).forEach((key) => {
          if (key.toLowerCase().startsWith('x-amz-')) {
            delete event.request!.headers![key];
          }
        });
      }

      // Filter out expected errors
      const error = hint.originalException as any;

      // User cancellation errors
      if (error?.message?.includes('User cancelled')) return null;
      if (error?.message?.includes('User canceled')) return null;
      if (error?.code === 'ERR_CANCELED') return null;

      // GraphQL validation errors (these will be caught in Apollo error link)
      if (error?.extensions?.code === 'BAD_USER_INPUT') return null;
      if (error?.extensions?.code === 'UNAUTHENTICATED') return null;

      // Network timeout errors (log but don't alert)
      if (error?.message?.includes('timeout')) {
        event.level = 'warning';
      }

      // Rate limit errors
      if (error?.message?.includes('rate limit')) return null;
      if (error?.message?.includes('429')) return null;

      return event;
    },

    // BeforeBreadcrumb: Scrub sensitive data from breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Scrub sensitive data from fetch/xhr breadcrumbs
      if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
        if (breadcrumb.data) {
          delete breadcrumb.data.Authorization;
          delete breadcrumb.data.authorization;
          delete breadcrumb.data.Cookie;
          delete breadcrumb.data.cookie;

          // Scrub GraphQL variables from URL
          if (breadcrumb.data.url?.includes('variables=')) {
            breadcrumb.data.url = breadcrumb.data.url.replace(
              /variables=[^&]*/,
              'variables=***REDACTED***'
            );
          }
        }
      }

      return breadcrumb;
    },
  });
};

// Helper function to set user context
export const setSentryUser = (user: {
  id: string;
  email?: string;
  username?: string;
  accountType?: string;
}) => {
  if (!featureFlags.sentry) return;
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  // Set additional context
  Sentry.setTag('user.accountType', user.accountType || 'unknown');
  Sentry.setTag('user.authenticated', 'true');
};

// Helper function to clear user context on logout
export const clearSentryUser = () => {
  if (!featureFlags.sentry) return;
  Sentry.setUser(null);
  Sentry.setTag('user.authenticated', 'false');
};

// Helper function to capture GraphQL errors
export const captureGraphQLError = (
  error: any,
  operationName: string,
  operationType: 'query' | 'mutation' | 'subscription'
) => {
  if (!featureFlags.sentry) return;
  // Filter out expected errors
  if (error?.extensions?.code === 'BAD_USER_INPUT') return;
  if (error?.extensions?.code === 'UNAUTHENTICATED') return;

  Sentry.captureException(error, {
    tags: {
      'graphql.operation': operationName,
      'graphql.type': operationType,
    },
    contexts: {
      graphql: {
        operationName,
        operationType,
        // Don't send actual variables (security)
        variables: '***REDACTED***',
      },
    },
  });
};
