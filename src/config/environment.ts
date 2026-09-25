import awsconfig from './aws';

// Automatically detect Amplify environment from aws-exports
// Shared by Sentry and PostHog to ensure consistent environment tagging
export const getAmplifyEnvironment = (): string => {
  if (__DEV__) return 'development';

  // Check OAuth domain for environment indicators
  const oauthDomain = awsconfig.oauth?.domain || '';

  // Match patterns like: whiskeysocial-{env}.auth... or whiskeysocial{hash}-{hash}-{env}.auth...
  if (oauthDomain.includes('-prod.auth') || oauthDomain.includes('-production.auth')) {
    return 'production';
  }
  if (oauthDomain.includes('-staging.auth') || oauthDomain.includes('-stag.auth')) {
    return 'staging';
  }
  if (oauthDomain.includes('-dev.auth') || oauthDomain.includes('-development.auth')) {
    return 'development';
  }

  // Fallback: check AppSync endpoint
  const appsyncEndpoint = awsconfig.aws_appsync_graphqlEndpoint || '';
  if (appsyncEndpoint.includes('prod') || appsyncEndpoint.includes('production')) {
    return 'production';
  }
  if (appsyncEndpoint.includes('staging') || appsyncEndpoint.includes('stag')) {
    return 'staging';
  }

  // Default to development if we can't determine
  return 'development';
};
