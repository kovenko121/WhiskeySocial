import { useAuth } from '@contexts';
import { getS3Image } from '@helpers';
import { amplify } from '@services';
import { User, Whiskey } from '@types';
import { useQuery } from '@tanstack/react-query';
import { useGetUser } from '../user/useGetUser';
import { GetWhiskey } from './query/getWhiskey';

type WhiskeyInfo = {
  id: string;
  user: User;
  rating: number;
  review: string;
  title: string;
  description: string;
  distillery: string;
  proof: number;
  age: number;
  origin: string;
  recommendationTags?: string[] | null;
  specialistReview: number;
};

type UseWhiskey = Whiskey & {
  myReview?: WhiskeyInfo;
  specialistReview?: WhiskeyInfo;
};

function useWhiskey(id: string, userId?: string) {
  const {
    user: { sub },
  } = useAuth();

  const { data: myUser } = useGetUser();

  return useQuery<UseWhiskey>({
    queryKey: ['get-whiskey', id],
    queryFn: async () => {
      const { getWhiskey, reviewsByWhiskeyIdAndSpecialistReviewAndRating } =
        await amplify.request<{
          getWhiskey: UseWhiskey;
          reviewsByWhiskeyIdAndSpecialistReviewAndRating: {
            items: WhiskeyInfo[];
          };
        }>(GetWhiskey, { id, userId: userId ?? sub });

      if (reviewsByWhiskeyIdAndSpecialistReviewAndRating.items.length) {
        // eslint-disable-next-line prefer-destructuring

        getWhiskey.myReview = getWhiskey.reviews?.items?.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        getWhiskey.reviews = reviewsByWhiskeyIdAndSpecialistReviewAndRating;

        getWhiskey.specialistReview =
          getWhiskey.reviews.items[0].specialistReview === 1
            ? getWhiskey.reviews.items[0]
            : null;

        if (getWhiskey.specialistReview) {
          getWhiskey.reviews.items.shift();
        }
      }

      if (getWhiskey.brandUser?.brandLogo) {
        getWhiskey.brandUser.brandLogo = await getS3Image(getWhiskey.brandUser.brandLogo);
      }
      if (getWhiskey.picture) {
        getWhiskey.picture = await getS3Image(getWhiskey.picture);
      }

      if (getWhiskey.reviews) {
        getWhiskey.reviews.items = getWhiskey?.reviews?.items
          .filter((item) => !myUser?.blockedUsers?.includes(item!.userId)).map((review) => review);
      }

      return getWhiskey;
    },
  });
}

export { useWhiskey };
