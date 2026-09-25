import { useAuth } from '@contexts';
import { useNavigation } from '@react-navigation/native';
import { amplify, queryClient } from '@services';
import { NavigationProps, ReviewRecommendationTags, RootStackParams, Whiskey } from '@types';
import { useMutation } from '@tanstack/react-query';
import { CreateReview } from './mutation/createReview';
import { capturePostHogEvent, groupPostHogBrand } from '../../config/posthog';

const useCreateReview = (nextPage: keyof RootStackParams = 'Home', onSuccessCallback?: () => void) => {
  const navigation = useNavigation<NavigationProps>();
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    { id: string },
    unknown,
    {
      whiskeyId: string;
      rating: number;
      title?: string;
      description?: string;
      recommendationTags?: ReviewRecommendationTags[];
    }
  >({
    mutationFn: async (data) => {
      const { createReview: review } = await amplify.request<{
        createReview: { id: string };
      }>(CreateReview, {
        userId: sub,
        whiskeyId: data.whiskeyId,
        rating: data.rating,
        title: data.title,
        description: data.description,
        recommendationTags: data.recommendationTags,
      });

      return review;
    },
    onSuccess(_, data) {
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
      queryClient.refetchQueries({ queryKey: ['list-user-rewards'] });

      try {
        const cachedWhiskey = queryClient.getQueryData<Whiskey>(['get-whiskey', data.whiskeyId]);

        // Register brand group before event association
        if (cachedWhiskey?.brandUser?.id) groupPostHogBrand(cachedWhiskey.brandUser.id, cachedWhiskey.brandUser.brandName);

        capturePostHogEvent('bottle_rated', {
          bottle_id: data.whiskeyId,
          brand_id: cachedWhiskey?.brandUser?.id,
          bottle_name: cachedWhiskey?.name,
          brand_name: cachedWhiskey?.brandUser?.brandName,
          rating: data.rating,
        }, { brand: cachedWhiskey?.brandUser?.id });
      } catch (err) {
        // ignore tracking errors
      }

      if (onSuccessCallback) {
        onSuccessCallback();
      } else {
        navigation.navigate(nextPage);
      }
    },
  });
};

export { useCreateReview };
