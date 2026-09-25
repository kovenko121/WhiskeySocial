import { useAuth } from '@contexts';
import { useNavigation } from '@react-navigation/native';
import { amplify, queryClient } from '@services';
import { NavigationProps, SettingsInput, User } from '@types';
import { useMutation } from '@tanstack/react-query';
import { UpdateSecuritySettings } from './mutation/updateSecuritySettings';

const useUpdateSecuritySettings = (nextPage: string) => {
  const {
    user: { sub },
  } = useAuth();
  const navigation = useNavigation<NavigationProps>();

  return useMutation<
    User,
    unknown,
    {
      securitySettings: SettingsInput[];
    }
  >({
    mutationFn: async (data) => {
      const { updateSecuritySettings } = await amplify.request<{
        updateSecuritySettings: User;
      }>(UpdateSecuritySettings, {
        id: sub,
        ...data,
      });

      return updateSecuritySettings;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
      navigation.navigate(nextPage as never);
    },
  });
};

export { useUpdateSecuritySettings };
