import { useAuth } from '@contexts';
import { withClubAdminCheck } from '@helpers';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const UpdateClubWhiskey = gql`
  mutation UpdateClubWhiskey($input: UpdateClubWhiskeyInput!) {
    updateClubWhiskey(input: $input) {
      id
      clubId
      whiskeyId
      notes
      updatedAt
    }
  }
`;

interface UpdateClubWhiskeyParams {
  id: string;
  clubId: string;
  notes?: string | null;
}

function useUpdateClubWhiskey() {
  const {
    user: { sub },
  } = useAuth();

  const updateClubWhiskeyFn = withClubAdminCheck(
    // clubId is used by withClubAdminCheck wrapper for admin verification
    async ({ id, notes }: UpdateClubWhiskeyParams) => {
      const { updateClubWhiskey } = await amplify.request<{
        updateClubWhiskey: { id: string; notes?: string | null };
      }>(UpdateClubWhiskey, {
        input: { id, notes },
      });

      return updateClubWhiskey;
    },
    'Only club admins can update club whiskey notes'
  );

  return useMutation({
    mutationFn: (params: UpdateClubWhiskeyParams) => updateClubWhiskeyFn(params, sub),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-whiskeys', variables.clubId] });
    },
  });
}

export { useUpdateClubWhiskey };
