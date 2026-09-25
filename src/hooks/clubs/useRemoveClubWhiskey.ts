import { useAuth } from '@contexts';
import { withClubAdminCheck } from '@helpers';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const DeleteClubWhiskey = gql`
  mutation DeleteClubWhiskey($input: DeleteClubWhiskeyInput!) {
    deleteClubWhiskey(input: $input) {
      id
      clubId
      whiskeyId
    }
  }
`;

interface RemoveClubWhiskeyParams {
  id: string;
  clubId: string;
}

function useRemoveClubWhiskey() {
  const {
    user: { sub },
  } = useAuth();

  const removeClubWhiskeyFn = withClubAdminCheck(
    // clubId is used by withClubAdminCheck wrapper for admin verification
    async ({ id }: RemoveClubWhiskeyParams) => {
      const { deleteClubWhiskey } = await amplify.request<{
        deleteClubWhiskey: { id: string };
      }>(DeleteClubWhiskey, {
        input: { id },
      });

      return deleteClubWhiskey;
    },
    'Only club admins can remove whiskeys from the club'
  );

  return useMutation<{ id: string }, Error, RemoveClubWhiskeyParams>({
    mutationFn: (params: RemoveClubWhiskeyParams) => removeClubWhiskeyFn(params, sub),
    onSuccess: (_result, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['club-whiskeys', variables.clubId] });
      queryClient.invalidateQueries({ queryKey: ['club', variables.clubId] });
    },
  });
}

export { useRemoveClubWhiskey };
