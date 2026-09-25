import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { MemberStatus } from '@types';
import { gql } from 'graphql-request';
import type { ClubMembership } from './useGetClubMembership';
import { createLogger } from '../../services/logger';

const logger = createLogger('useValidateClubMembership');

const GetClubMembershipByUser = gql`
  query GetClubMembershipByUser(
    $userId: ID!
    $clubId: ModelIDKeyConditionInput
  ) {
    clubMembersByUserIdAndClubId(userId: $userId, clubId: $clubId) {
      items {
        id
        status
      }
    }
  }
`;

interface ValidateMembershipResult {
  isValid: boolean;
  error?: string;
}

export const DefaultClubPollingInterval = 300000; // 5 minutes

/**
 * Validates that the current user is an ACTIVE member of the specified club.
 * Checks React Query cache first (fresh if polling is active), falls back to API call if stale.
 */
async function validateClubMembership(
  clubId: string,
  userId: string
): Promise<ValidateMembershipResult> {
  // First check cache (will be fresh if user is on a club screen with polling)
  const cachedMembership = queryClient.getQueryData<ClubMembership | null>([
    'club-membership',
    clubId,
    userId,
  ]);

  // Check cache staleness - if data is older than 5 seconds, fetch fresh
  const cacheState = queryClient.getQueryState([
    'club-membership',
    clubId,
    userId,
  ]);
  const isCacheStale =
    !cacheState?.dataUpdatedAt || Date.now() - cacheState.dataUpdatedAt > 5000;

  let membershipStatus: MemberStatus | undefined;

  if (cachedMembership && !isCacheStale) {
    membershipStatus = cachedMembership.status;
  } else {
    // Cache is stale or missing - fetch fresh data
    try {
      const { clubMembersByUserIdAndClubId } = await amplify.request<{
        clubMembersByUserIdAndClubId: {
          items: Array<{ id: string; status: MemberStatus }>;
        };
      }>(GetClubMembershipByUser, {
        userId,
        clubId: { eq: clubId },
      });
      membershipStatus = clubMembersByUserIdAndClubId.items[0]?.status;
    } catch (error) {
      logger.error(
        `Error fetching membership for user ${userId} in club ${clubId}`,
        error as Error
      );
      return {
        isValid: false,
        error: 'Failed to validate club membership. Please try again.',
      };
    }
  }

  if (membershipStatus !== MemberStatus.ACTIVE) {
    return {
      isValid: false,
      error: 'You are not a member of this club',
    };
  }

  return { isValid: true };
}

/**
 * Hook that provides a membership validation function bound to the current user.
 *
 * Note: useCreatePost already performs membership validation internally for club posts.
 * This hook is primarily for manual validation in other contexts (e.g., CommentPostScreen)
 * where you need to check club membership before performing an action.
 */
function useValidateClubMembership() {
  const {
    user: { sub },
  } = useAuth();

  return {
    validateMembership: (clubId: string) => validateClubMembership(clubId, sub),
  };
}

export { useValidateClubMembership, validateClubMembership };
export type { ValidateMembershipResult };
