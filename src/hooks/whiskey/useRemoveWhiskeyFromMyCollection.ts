import { useAuth } from '@contexts';
import { useNavigation } from '@react-navigation/native';
import { amplify, queryClient } from '@services';
import { NavigationProps } from '@types';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { createLogger } from '../../services/logger';
import { RemoveWhiskeyFromMyCollection } from './mutation/removeWhiskeyFromMyCollection';

const logger = createLogger('useRemoveWhiskeyFromMyCollection');

const useRemoveWhiskeyFromMyCollection = (nextPage?: any) => {
  const navigation = useNavigation<NavigationProps>();
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    { id: string },
    unknown,
    {
      id: string;
    }
  >({
    mutationFn: async (data) => {
      const { deleteUserWhiskeys } = await amplify.request<{
        deleteUserWhiskeys: { id: string };
      }>(RemoveWhiskeyFromMyCollection, data);

      return deleteUserWhiskeys;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
      if (nextPage) {
        navigation.navigate(nextPage as any);
      }
    },
    onError(error) {
      logger.error('Failed to remove whiskey from collection', error instanceof Error ? error : new Error(String(error)));
      Alert.alert(
        'Delete Failed',
        'Unable to remove this bottle. Please try again.',
        [{ text: 'OK' }]
      );
    },
  });
};

export { useRemoveWhiskeyFromMyCollection };
