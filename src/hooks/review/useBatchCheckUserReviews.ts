import { amplify } from '@services';
import { reviewsByUserIdAndWhiskeyId } from '../../graphql/queries';
import { createLogger } from '../../services/logger';

const logger = createLogger('useBatchCheckUserReviews');

const useBatchCheckUserReviews = () => {
  const getReviewedWhiskeyIds = async (
    whiskeyIds: string[],
    userId: string
  ): Promise<string[]> => {
    try {
      if (whiskeyIds.length === 0) {
        return [];
      }

      // Query all reviews for this user in parallel
      const reviewPromises = whiskeyIds.map(async (whiskeyId) => {
        try {
          const { reviewsByUserIdAndWhiskeyId: userReviews } = await amplify.request<{
            reviewsByUserIdAndWhiskeyId: {
              items: Array<{ id: string; whiskeyId: string; rating: number }>;
            };
          }>(reviewsByUserIdAndWhiskeyId, {
            userId,
            whiskeyId: { eq: whiskeyId },
            limit: 1,
          });

          // If reviews exist for this whiskey, return the whiskeyId
          return userReviews.items.length > 0 ? whiskeyId : null;
        } catch (error) {
          logger.error(`Error checking review for whiskey ${whiskeyId}:`, error as Error);
          return null;
        }
      });

      const results = await Promise.all(reviewPromises);

      // Filter out nulls and return only whiskey IDs that have reviews
      return results.filter((id): id is string => id !== null);
    } catch (error) {
      logger.error('Error batch checking user reviews:', error as Error);
      return [];
    }
  };

  return { getReviewedWhiskeyIds };
};

export { useBatchCheckUserReviews };
