import { useAuth } from '@contexts';
import { withClubAdminCheck } from '@helpers';
import { amplify, queryClient } from '@services';
import { Club } from '@types';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';

const UpdateClub = gql`
  mutation UpdateClub($input: UpdateClubInput!) {
    updateClub(input: $input) {
      id
      clubName
      searchName
      clubDetails
      coverPhoto
      profilePicture
      isPrivate
      createdBy
      createdAt
      updatedAt
      pinnedPostId
      pinnedBy
      memberCount
      whiskeyCount
      __typename
    }
  }
`;

interface UpdateClubInput {
  id: string;
  clubName?: string;
  clubDetails?: string | null;
  coverPhoto?: string | null;
  profilePicture?: string | null;
  pinnedPostId?: string | null;
  pinnedBy?: string | null;
  isPrivate?: boolean;
}

function useUpdateClub() {
  const {
    user: { sub },
  } = useAuth();

  const updateClubFn = withClubAdminCheck(
    // id is the clubId - used by withClubAdminCheck wrapper for admin verification
    async (input: UpdateClubInput & { clubId: string }) => {
      // Remove clubId from input before sending to GraphQL (it's only used for admin check)
      const { clubId, ...updateInput } = input;

      // Generate searchName from clubName if clubName is being updated
      const finalInput: UpdateClubInput & { searchName?: string } = { ...updateInput };
      if (updateInput.clubName) {
        finalInput.searchName = updateInput.clubName.trim().toLowerCase();
      }

      const { updateClub } = await amplify.request<{
        updateClub: Club;
      }>(UpdateClub, {
        input: finalInput,
      });

      return updateClub;
    },
    'Only club admins can update club settings'
  );

  return useMutation({
    mutationFn: (input: UpdateClubInput) => 
      // Add clubId to params for admin check (id is the clubId)
       updateClubFn({ ...input, clubId: input.id }, sub)
    ,
    onSuccess: (_data, variables) => {
      // Refetch club data to show updated info
      queryClient.invalidateQueries({ queryKey: ['club', variables.id] });
      // Refetch clubs list
      queryClient.invalidateQueries({ queryKey: ['clubs', 'list'] });
      // Refetch club search results (club name or details may have changed)
      queryClient.invalidateQueries({ queryKey: ['search-clubs'] });
    },
  });
}

export { useUpdateClub };
export type { UpdateClubInput };
