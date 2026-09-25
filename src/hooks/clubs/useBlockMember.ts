import { useAuth } from '@contexts';
import { withClubAdminCheck } from '@helpers';
import { amplify, queryClient } from '@services';
import { ClubMember, MemberStatus } from '@types';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useRef, useEffect } from 'react';

const UpdateClubMember = gql`
  mutation UpdateClubMember($input: UpdateClubMemberInput!) {
    updateClubMember(input: $input) {
      id
      clubId
      userId
      role
      status
      __typename
    }
  }
`;

function useBlockMember() {
  const {
    user: { sub },
  } = useAuth();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }, []);

  const blockMemberFn = withClubAdminCheck(
    // clubId is used by withClubAdminCheck wrapper for admin verification
    // userId is passed by wrapper and represents the admin performing the block action
    async ({
      memberId,
    }: {
      clubId: string;
      memberId: string;
    }) => {
      // Update member status to BLOCKED - Lambda will handle memberCount update via DynamoDB stream
      const { updateClubMember } = await amplify.request<{
        updateClubMember: ClubMember;
      }>(UpdateClubMember, {
        input: {
          id: memberId,
          status: MemberStatus.BLOCKED,
        },
      });

      return updateClubMember;
    },
    'Only club admins can block members'
  );

  return useMutation({
    mutationFn: (params: {
      clubId: string;
      memberId: string;
    }) => blockMemberFn(params, sub),
    onSuccess: (_data, variables) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Invalidate relevant queries immediately
      queryClient.invalidateQueries({ queryKey: ['club', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-members', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-pending-members', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-blocked-members', variables.clubId] });

      // Invalidate posts queries again after a delay to ensure Lambda has finished deleting posts
      // Lambda typically takes 1-2 seconds to process via DynamoDB Stream
      // Timeout is cleaned up on unmount to prevent memory leaks
      timeoutRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['club-posts', variables.clubId] });
        timeoutRef.current = null;
      }, 2000);
    },
  });
}

export { useBlockMember };
