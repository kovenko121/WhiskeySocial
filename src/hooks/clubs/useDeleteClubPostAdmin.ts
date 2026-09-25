import { useAuth } from '@contexts';
import { withClubAdminCheck } from '@helpers';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { createLogger } from '../../services/logger';

const logger = createLogger('useDeleteClubPostAdmin');

/**
 * GraphQL mutation for club admins to delete posts in their club.
 * This calls the DeleteClubPostsAdmin Lambda which verifies the caller
 * is an admin (CLUBADMINROLE or CLUBOWNERROLE) of the club.
 *
 * Note: Authors deleting their OWN posts should use useDeletePost instead.
 * This hook is specifically for admins moderating other users' content.
 */
const DeleteClubPostAdmin = gql`
  mutation DeleteClubPostAdmin($postId: ID!) {
    deleteClubPostAdmin(postId: $postId) {
      success
      postId
      message
    }
  }
`;

interface DeleteClubPostAdminResult {
  success: boolean;
  postId: string | null;
  message: string;
}

interface DeleteClubPostAdminInput {
  postId: string;
  clubId: string;
}

/**
 * Custom hook for club admins to delete posts in their club.
 * Uses the DeleteClubPostsAdmin Lambda which authorizes deletion for
 * club admins only (CLUBADMINROLE or CLUBOWNERROLE).
 *
 * For authors deleting their own posts, use useDeletePost instead.
 *
 * @param onSuccess - Optional callback when deletion succeeds
 * @param onError - Optional callback when deletion fails
 */
function useDeleteClubPostAdmin(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const {
    user: { sub },
  } = useAuth();

  const deleteClubPostAdminFn = withClubAdminCheck(
    // clubId is used by withClubAdminCheck wrapper for admin verification
    async ({ postId }: DeleteClubPostAdminInput) => {
      const { deleteClubPostAdmin } = await amplify.request<{
        deleteClubPostAdmin: DeleteClubPostAdminResult;
      }>(DeleteClubPostAdmin, {
        postId,
      });

      // Check if the Lambda returned a failure or empty response
      if (!deleteClubPostAdmin || !deleteClubPostAdmin.success) {
        throw new Error(deleteClubPostAdmin?.message || 'Failed to delete post');
      }

      return deleteClubPostAdmin;
    },
    'Only club admins can delete club posts'
  );

  return useMutation<DeleteClubPostAdminResult, Error, DeleteClubPostAdminInput>({
    mutationFn: (params: DeleteClubPostAdminInput) => deleteClubPostAdminFn(params, sub),
    onSuccess: (_data, variables) => {
      // Refetch club posts to reflect deletion
      queryClient.invalidateQueries({ queryKey: ['club-posts', variables.clubId] });
      // Refetch club data in case pinned post was cleared
      queryClient.invalidateQueries({ queryKey: ['club', variables.clubId] });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      logger.error('Delete failed:', error);
      if (onError) {
        onError(error);
      }
    },
  });
}

export { useDeleteClubPostAdmin };
export type { DeleteClubPostAdminInput, DeleteClubPostAdminResult };
