/**
 * Error codes for custom errors
 */
export const ErrorCodes = {
  UNAUTHORIZED_CLUB_ACTION: 'UNAUTHORIZED_CLUB_ACTION',
} as const;

/**
 * Error names for custom errors
 */
export const ErrorNames = {
  UNAUTHORIZED_CLUB_ACTION: 'UnauthorizedClubActionError',
} as const;

/**
 * Custom error for unauthorized club admin actions
 */
export class UnauthorizedClubActionError extends Error {
  readonly code = ErrorCodes.UNAUTHORIZED_CLUB_ACTION;

  constructor(message: string) {
    super(message);
    this.name = ErrorNames.UNAUTHORIZED_CLUB_ACTION;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnauthorizedClubActionError);
    }
  }
}

/**
 * Type guard to check if an error is an UnauthorizedClubActionError.
 * Uses multiple checks to be robust across different execution contexts
 * (serialization, worker boundaries, hot reloading, etc.)
 */
export function isUnauthorizedClubActionError(error: unknown): error is UnauthorizedClubActionError {
  if (!error || typeof error !== 'object') {
    return false;
  }

  // Primary check: instanceof
  if (error instanceof UnauthorizedClubActionError) {
    return true;
  }

  // Fallback checks for serialized/deserialized errors
  const err = error as Record<string, unknown>;

  // Check by code property
  if (err.code === ErrorCodes.UNAUTHORIZED_CLUB_ACTION) {
    return true;
  }

  // Check by name property
  if (err.name === ErrorNames.UNAUTHORIZED_CLUB_ACTION) {
    return true;
  }

  return false;
}
