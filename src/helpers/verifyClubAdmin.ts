import { amplify } from '@services';
import { ClubRole, MemberStatus } from '@types';
import { gql } from 'graphql-request';
import { createLogger } from '../services/logger';

const logger = createLogger('verifyClubAdmin');

const GetClubMemberByUser = gql`
  query GetClubMemberByUser(
    $userId: ID!
    $clubId: ModelIDKeyConditionInput
  ) {
    clubMembersByUserIdAndClubId(
      userId: $userId
      clubId: $clubId
      limit: 1
    ) {
      items {
        id
        clubId
        userId
        role
        status
        __typename
      }
    }
  }
`;

interface ClubMemberRecord {
  id: string;
  clubId: string;
  userId: string;
  role: ClubRole;
  status: MemberStatus;
}

interface VerifyClubAdminParams {
  clubId: string;
  userId: string;
}

/**
 * Verifies that a user is an admin (CLUBADMINROLE or CLUBOWNERROLE) for a specific club
 * by querying the ClubMember table in the database.
 *
 * @param clubId - The ID of the club
 * @param userId - The ID of the user to verify
 * @returns True if the user is an admin/owner with ACTIVE status, false otherwise
 * @throws Error if the database query fails
 */
export async function verifyClubAdmin({ clubId, userId }: VerifyClubAdminParams): Promise<boolean> {
  try {
    const { clubMembersByUserIdAndClubId } = await amplify.request<{
      clubMembersByUserIdAndClubId: { items: ClubMemberRecord[] };
    }>(GetClubMemberByUser, {
      userId,
      clubId: { eq: clubId },
    });

    const membership = clubMembersByUserIdAndClubId.items[0];

    // User must have an ACTIVE membership and be either an ADMIN or OWNER
    if (!membership || membership.status !== MemberStatus.ACTIVE) {
      return false;
    }

    return (
      membership.role === ClubRole.CLUBADMINROLE ||
      membership.role === ClubRole.CLUBOWNERROLE
    );
  } catch (error) {
    logger.error('Error verifying club admin status:', error as Error);
    throw new Error('Failed to verify club admin permissions');
  }
}
