import { useAuth } from '@contexts';
import { useNavigation } from '@react-navigation/native';
import { amplify, queryClient } from '@services';
import { NavigationProps,
  Routes
} from '@types';
import { useMutation } from '@tanstack/react-query';
import { DeleteWhiskeyFromWishlist } from './mutation/removeWhiskeyFromWishlist';

const useRemoveWhiskeyFromWishlist = (redirect?: boolean) => {
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
      const { deleteUserWishListWhiskeys } = await amplify.request<{
        deleteUserWishListWhiskeys: { id: string };
      }>(DeleteWhiskeyFromWishlist, {
        id: `${sub}-${data?.whiskeyId}`,
      });

      return deleteUserWishListWhiskeys;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['get-user', sub] });
      if (redirect) {
        navigation.navigate(Routes.MyCollection);
      }
    },
  });
};

export { useRemoveWhiskeyFromWishlist };
