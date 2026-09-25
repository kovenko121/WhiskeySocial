import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { useMutation } from '@tanstack/react-query';
import { UserFavoriteGuides } from '../../types/api';
import { CreateUserFavoriteGuides } from './mutation/createUserFavoriteGuides';

const useCreateUserFavoriteArticles = () => {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    UserFavoriteGuides,
    unknown,
    {
      guideId: string;
    }
  >({
    mutationFn: async (data) => {
      const { createUserFavoriteGuides } = await amplify.request<{
        createUserFavoriteGuides: UserFavoriteGuides;
      }>(CreateUserFavoriteGuides, {
        id: `${sub}-${data.guideId}`,
        userId: sub,
        ...data,
      });

      return createUserFavoriteGuides;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['list-guides'] });
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
    },
  });
};

export { useCreateUserFavoriteArticles };
