import { useAuth } from '@contexts';
import { withClubAdminCheck } from '@helpers';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const CheckClubWhiskeyExists = gql`
  query CheckClubWhiskeyExists($whiskeyId: ID!, $clubId: ModelIDKeyConditionInput) {
    clubWhiskeysByWhiskeyIdAndClubId(whiskeyId: $whiskeyId, clubId: $clubId, limit: 1) {
      items {
        id
      }
    }
  }
`;

const CreateClubWhiskey = gql`
  mutation CreateClubWhiskey($input: CreateClubWhiskeyInput!) {
    createClubWhiskey(input: $input) {
      id
      clubId
      whiskeyId
      addedBy
      addedAt
      notes
    }
  }
`;

interface AddClubWhiskeyParams {
  clubId: string;
  whiskeyId: string;
  notes?: string;
}

interface AddClubWhiskeyResult {
  success: boolean;
  isDuplicate?: boolean;
  clubWhiskeyId?: string;
}

function useAddClubWhiskey() {
  const {
    user: { sub },
  } = useAuth();

  const addClubWhiskeyFn = withClubAdminCheck(
    // clubId is used by withClubAdminCheck wrapper for admin verification
    // userId is used to track who added the whiskey
    async ({ clubId, whiskeyId, notes }: AddClubWhiskeyParams, userId: string): Promise<AddClubWhiskeyResult> => {
      // Check for duplicate first
      const { clubWhiskeysByWhiskeyIdAndClubId } = await amplify.request<{
        clubWhiskeysByWhiskeyIdAndClubId: { items: { id: string }[] };
      }>(CheckClubWhiskeyExists, {
        whiskeyId,
        clubId: { eq: clubId },
      });

      if (clubWhiskeysByWhiskeyIdAndClubId.items.length > 0) {
        return { success: false, isDuplicate: true };
      }

      // Create the club whiskey
      const { createClubWhiskey } = await amplify.request<{
        createClubWhiskey: { id: string };
      }>(CreateClubWhiskey, {
        input: {
          clubId,
          whiskeyId,
          addedBy: userId,
          addedAt: new Date().toISOString(),
          notes: notes || null,
        },
      });

      return { success: true, clubWhiskeyId: createClubWhiskey.id };
    },
    'Only club admins can add whiskeys to the club'
  );

  return useMutation<AddClubWhiskeyResult, Error, AddClubWhiskeyParams>({
    mutationFn: (params: AddClubWhiskeyParams) => addClubWhiskeyFn(params, sub),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['club-whiskeys', variables.clubId] });
        queryClient.invalidateQueries({ queryKey: ['club', variables.clubId] });
      }
    },
  });
}

export { useAddClubWhiskey };
