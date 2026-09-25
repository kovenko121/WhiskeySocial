import { ClientError } from 'graphql-request';
import { captureGraphQLError } from '../config/sentry';
import { createLogger } from './logger';

const logger = createLogger('graphql-error-handler');

/**
 * GraphQL Error Handler for graphql-request client
 *
 * This wraps graphql-request calls and captures errors in Sentry
 * while filtering out expected errors like validation and auth failures
 */

export const handleGraphQLError = (
  error: unknown,
  operationName: string,
  operationType: 'query' | 'mutation' | 'subscription' = 'query'
) => {
  if (error instanceof ClientError) {
    const gqlErrors = error.response.errors;

    if (gqlErrors) {
      gqlErrors.forEach((gqlError) => {
        // Extract error code from extensions
        const errorCode = gqlError.extensions?.code as string | undefined;

        // Skip expected errors
        if (errorCode === 'BAD_USER_INPUT') return;
        if (errorCode === 'UNAUTHENTICATED') return;
        if (errorCode === 'FORBIDDEN') return;

        // Capture unexpected errors in Sentry
        captureGraphQLError(gqlError, operationName, operationType);
      });
    }

    // Also check for network errors
    if (error.message.includes('Failed to fetch')) {
      // Network errors - these might be transient, don't spam Sentry
      if (__DEV__) {
        logger.warn(`GraphQL Network Error in ${operationName}:`, error);
      }
    }
  }

  // Re-throw the error so the caller can handle it
  throw error;
};

/**
 * Wrapper for GraphQL requests with automatic error tracking
 *
 * Usage:
 * const data = await executeGraphQLWithTracking(
 *   () => amplify.request(GetUserQuery, { id: userId }),
 *   'GetUser',
 *   'query'
 * );
 */
export const executeGraphQLWithTracking = async <T>(
  requestFn: () => Promise<T>,
  operationName: string,
  operationType: 'query' | 'mutation' | 'subscription' = 'query'
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    handleGraphQLError(error, operationName, operationType);
    // This line won't be reached because handleGraphQLError throws,
    // but TypeScript needs it for type safety
    throw error;
  }
};
