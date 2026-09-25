import { capitalizeAll } from '@helpers';
import { useNavigation } from '@react-navigation/native';
import { amplify, queryClient } from '@services';
import { NavigationProps, UserReward,
  Routes
} from '@types';
import { useMutation } from '@tanstack/react-query';
import { UpdateShippingInfo } from './mutation/updateShippingInfo';

const useUpdateShippingInfo = () => {
  const navigation = useNavigation<NavigationProps>();

  return useMutation<
    UserReward,
    unknown,
    {
      rewardId: string;
      shirtSize?: string;
      shirtModel?: string;
      fullName: string;
      email: string;
      addressFirst: string;
      addressSecond?: string;
      cityName: string;
      stateName: string;
      zipcode: string;
    }
  >({
    mutationFn: async (data) => {
      const { updateUserReward } = await amplify.request<{
        updateUserReward: UserReward;
      }>(UpdateShippingInfo, {
        id: data.rewardId,
        address: capitalizeAll(
          data.addressSecond
            ? data.addressFirst.concat(' - ').concat(data.addressSecond)
            : data.addressFirst
        ),
        city: capitalizeAll(data.cityName),
        email: data.email.toLowerCase(),
        fullName: capitalizeAll(data.fullName),
        size: data.shirtSize,
        model: data.shirtModel,
        isRedeemed: true,
        state: capitalizeAll(data.stateName),
        zipcode: data.zipcode,
      });

      return updateUserReward;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['list-user-rewards'] });
      navigation.navigate(Routes.RedeemConfirmation);
    },
  });
};

export { useUpdateShippingInfo };
