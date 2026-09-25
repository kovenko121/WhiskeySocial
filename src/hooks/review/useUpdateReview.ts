import { useAuth } from '@contexts';
import { useNavigation } from '@react-navigation/native';
import { amplify, queryClient } from '@services';
import { NavigationProps, ReviewRecommendationTags, RootStackParams, Whiskey } from '@types';
import { useMutation } from '@tanstack/react-query';
import { UpdateReview } from './mutation/updateReview';
import { capturePostHogEvent, groupPostHogBrand } from '../../config/posthog';

const useUpdateReview = (nextPage: keyof RootStackParams = 'Home', onSuccessCallback?: () => void) => {
  const navigation = useNavigation<NavigationProps>();
  const {
    user: { sub },
  } = useAuth();

  return useMutation<
    { id: string },
    unknown,
    {
      id: string;
      whiskeyId: string;
      rating?: number;
      title?: string;
      description?: string;
      recommendationTags?: ReviewRecommendationTags[];
      specialistReview?: number | null;
    }
  >({
    mutationFn: async (data) => {
      const { updateReview: review } = await amplify.request<{
        updateReview: { id: string };
      }>(UpdateReview, {
        id: data.id,
        rating: data.rating,
        title: data.title,
        description: data.description,
        recommendationTags: data.recommendationTags,
        specialistReview: data.specialistReview ?? null,
      });
      return review;
    },
    onSuccess(_, data) {
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
      queryClient.refetchQueries({ queryKey: ['get-whiskey', data.whiskeyId] });

      try {
        const cachedWhiskey = queryClient.getQueryData<Whiskey>(['get-whiskey', data.whiskeyId]);

        if (cachedWhiskey?.brandUser?.id) groupPostHogBrand(cachedWhiskey.brandUser.id, cachedWhiskey.brandUser.brandName);

        capturePostHogEvent('bottle_rated', {
          bottle_id: data.whiskeyId,
          brand_id: cachedWhiskey?.brandUser?.id,
          bottle_name: cachedWhiskey?.name,
          brand_name: cachedWhiskey?.brandUser?.brandName,
          rating: data.rating,
          edit: true,
        }, { brand: cachedWhiskey?.brandUser?.id });
      } catch (err) {
        // ignore tracking errors
      }

      if (onSuccessCallback) {
        onSuccessCallback();
      } else {
        navigation.navigate(nextPage);
      }
    }
  });
};

export { useUpdateReview };
