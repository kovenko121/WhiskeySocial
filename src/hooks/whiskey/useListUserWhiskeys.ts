import { useAuth } from '@contexts';
import { amplify } from '@services';
import { useQuery } from '@tanstack/react-query';
import { ListUserWhiskeysId } from './query/listUserWhiskeysId';

function useListUserWhiskeys(whiskeyId: string) {
  const {
    user: { sub },
  } = useAuth();

  return useQuery({
    queryKey: ['list-user-whiskeys', whiskeyId],
    queryFn: async () => {
      const { listUserWhiskeys } = await amplify.request<{
        listUserWhiskeys: { items: [{ id: string; archived?: boolean | null }] };
      }>(ListUserWhiskeysId, {
        userId: sub,
        whiskeyId,
      });

      return listUserWhiskeys;
    },
  });
}

export { useListUserWhiskeys };
