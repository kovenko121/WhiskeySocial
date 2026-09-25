import { useAuth } from '@contexts';
import { useNavigation } from '@react-navigation/native';
import { amplify } from '@services';
import { NavigationProps, Suggestion } from '@types';
import { useMutation } from '@tanstack/react-query';
import awsconfig from '../../config/aws';
import { CreateWhiskeySuggestion } from './mutation/createWhiskeySuggestion';

const useCreateWhiskeySuggestion = (nextPage: string) => {
  const navigation = useNavigation<NavigationProps>();
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    Suggestion,
    unknown,
    {
      name: string;
      brand: string;
      years?: string;
      barcode?: string;
      whiskeyPicture: string;
    }
  >({
    mutationFn: async (data) => {
      const { createSuggestion } = await amplify.request<{
        createSuggestion: Suggestion;
      }>(CreateWhiskeySuggestion, {
        photo: {
          key: data.whiskeyPicture,
          bucket: awsconfig.aws_user_files_s3_bucket,
          region: awsconfig.aws_user_files_s3_bucket_region,
        },
        name: data.name.trim(),
        brand: data.brand.trim(),
        year: data.years?.trim(),
        barcode: data.barcode?.trim(),
        userId: sub,
      });

      return createSuggestion;
    },
    onSuccess() {
      navigation.navigate(nextPage as never);
    },
  });
};

export { useCreateWhiskeySuggestion };
