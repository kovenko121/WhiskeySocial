import { amplify } from '@services';
import { reviewsByUserIdAndWhiskeyId } from '../../graphql/queries';
import { createLogger } from '../../services/logger';

const logger = createLogger('useCheckUserReview');

const useCheckUserReview = () => {
  const checkIfUserHasReviewed = async (
    whiskeyId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      // Query reviews using the byUserAndWhiskey GSI with whiskeyId as sort key
      // This allows efficient querying by both userId and whiskeyId
      const { reviewsByUserIdAndWhiskeyId: userReviews } = await amplify.request<{
        reviewsByUserIdAndWhiskeyId: {
          items: Array<{ id: string; whiskeyId: string; rating: number }>;
        };
      }>(reviewsByUserIdAndWhiskeyId, {
        userId,
        whiskeyId: { eq: whiskeyId },
        limit: 1,
      });

      // If any reviews are returned, the user has reviewed this whiskey
      return userReviews.items.length > 0;
    } catch (error) {
      logger.error('Error checking if user has reviewed whiskey:', error as Error);
      return false;
    }
  };

  return { checkIfUserHasReviewed };
};

export { useCheckUserReview };
