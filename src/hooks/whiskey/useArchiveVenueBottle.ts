import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { useGetUser } from '../user/useGetUser';
import { ArchiveVenueBottle } from './mutation/archiveVenueBottle';

const useArchiveVenueBottle = () => {
  const { data: user } = useGetUser();

  return useMutation<
    { id: string; archived: boolean },
    unknown,
    { bottleId: string; archived: boolean }
  >({
    mutationFn: async ({ bottleId, archived }) => {
      const { updateUserWhiskeys } = await amplify.request<{
        updateUserWhiskeys: { id: string; archived: boolean };
      }>(ArchiveVenueBottle, { bottleId, archived });

      return updateUserWhiskeys;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-user', user?.id] });
      queryClient.refetchQueries({ queryKey: ['list-user-whiskeys'] });
    },
  });
};

export { useArchiveVenueBottle };
