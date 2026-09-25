import { UnauthorizedClubActionError } from './errors';
import { verifyClubAdmin } from './verifyClubAdmin';

/**
 * Higher-order function that wraps an async function with club admin verification.
 * Checks if the user has admin privileges before executing the wrapped function.
 *
 * @param fn - The async function to wrap
 * @param errorMessage - Custom error message if verification fails
 * @returns A wrapped function that performs admin check before execution
 *
 * @example
 * const addWhiskey = withClubAdminCheck(
 *   async ({ clubId, whiskeyId }) => {
 *     // ... implementation
 *   },
 *   'Only club admins can add whiskeys to the club'
 * );
 */
export function withClubAdminCheck<TParams extends { clubId: string }, TResult>(
  fn: (params: TParams, userId: string) => Promise<TResult>,
  errorMessage: string
) {
  return async (params: TParams, userId: string): Promise<TResult> => {
    // Verify user is a club admin
    const isAdmin = await verifyClubAdmin({ clubId: params.clubId, userId });
    if (!isAdmin) {
      throw new UnauthorizedClubActionError(errorMessage);
    }

    // Execute the wrapped function
    return fn(params, userId);
  };
}
