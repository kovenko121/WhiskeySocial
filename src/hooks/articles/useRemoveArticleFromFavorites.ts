import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts';
import { RemoveGuideFromFavorites } from './mutation/removeGuideFromFavorites';

const useRemoveArticleFromFavorites = () => {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    { guideId: string },
    unknown,
    {
      guideId: string;
    }
  >({
    mutationFn: async (data) => {
      const { deleteUserFavoriteGuide } = await amplify.request<{
        deleteUserFavoriteGuide: { guideId: string };
      }>(RemoveGuideFromFavorites, {
        id: `${sub}-${data.guideId}`,
      });
      return deleteUserFavoriteGuide;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['list-guides'] });
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
    },
  });
};

export { useRemoveArticleFromFavorites };
