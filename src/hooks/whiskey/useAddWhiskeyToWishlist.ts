import { useAuth } from '@contexts';
import { useNavigation } from '@react-navigation/native';
import { amplify, queryClient } from '@services';
import { NavigationProps,
  Routes
} from '@types';
import { useMutation } from '@tanstack/react-query';
import { AddWhiskeyToWishList } from './mutation/addWhiskeyToWishlist';

const useAddWhiskeyToWishlist = (redirect?: boolean) => {
  const navigation = useNavigation<NavigationProps>();
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    { id: string },
    unknown,
    {
      whiskeyId: string;
    }
  >({
    mutationFn: async (data) => {
      const { createUserWishListWhiskeys } = await amplify.request<{
        createUserWishListWhiskeys: { id: string };
      }>(AddWhiskeyToWishList, {
        userId: sub,
        id: `${sub}-${data?.whiskeyId}`,
        ...data,
      });

      return createUserWishListWhiskeys;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['get-user', sub] });
      if (redirect) {
        navigation.navigate(Routes.MyCollection);
      }
    },
  });
};

export { useAddWhiskeyToWishlist };
