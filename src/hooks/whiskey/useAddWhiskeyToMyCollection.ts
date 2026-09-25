import { useNavigation } from '@react-navigation/native';
import { amplify, queryClient, getCurrentScreenName } from '@services';
import { NavigationProps, ReviewRecommendationTags, UserType, ProofType, Whiskey } from '@types';
import { useMutation } from '@tanstack/react-query';
import { useGetUser } from '../user/useGetUser';
import { AddWhiskeyToMyCollection } from './mutation/addWhiskeyToMyCollection';
import { AddWhiskeyToMyCollectionAndReview } from './mutation/addWhiskeyToMyCollectionAndReview';
import { capturePostHogEvent, groupPostHogBrand } from '../../config/posthog';

const useAddWhiskeyToMyCollection = (nextPage = 'MyCollection') => {
  const navigation = useNavigation<NavigationProps>();
  const { data: user } = useGetUser();

  return useMutation<
    { id: string },
    unknown,
    {
      whiskeyId: string;
      title?: string;
      rating?: number;
      description?: string;
      recommendationTags?: ReviewRecommendationTags[];
      age?: string;
      batch?: string;
      proof?: string | null;
      proofType?: ProofType;
      bottle?: string;
      barrel?: string;
      rick?: string;
      warehouse?: string;
      storePick?: string;
      singleBarrel?: boolean;
      purchaseYear?: string;
      style?: string;
      notes?: string;
    },
    { sourceScreen: string }
  >({
    // Read the surface the add was triggered from while it is still current: the
    // mutation resolves over the network, by which time the user may have moved on.
    onMutate: () => ({ sourceScreen: getCurrentScreenName() }),
    mutationFn: async (data) => {
      const { createUserWhiskeys } = await amplify.request<{
        createUserWhiskeys: { id: string };
      }>(
        data?.rating
          ? AddWhiskeyToMyCollectionAndReview
          : AddWhiskeyToMyCollection,
        {
          userId: user?.id,
          ...(user?.userType === UserType.VENUE && {
            geo: user?.venueAddressGeo,
          }),
          ...data,
          // After the spread, not before: `...data` carries the raw string and
          // would otherwise put it back over the parsed number.
          proof: data?.proof != null ? parseFloat(data.proof) : null,
          singleBarrel: data?.singleBarrel !== undefined ? data.singleBarrel : null,
        }
      );

      return createUserWhiskeys;
    },
    onSuccess(result, data, context) {
      const cachedWhiskey = queryClient.getQueryData<Whiskey>(['get-whiskey', data.whiskeyId]);

      // Append the new bottle to the cached collection instead of refetching the
      // whole (unbounded) get-user query on every add. Repeated full refetches of a
      // large collection are what crashes the app at scale. We only take the cheap
      // optimistic path when we already have the whiskey cached; otherwise fall back
      // to a single refetch so we never insert a malformed item into the list.
      if (cachedWhiskey) {
        queryClient.setQueriesData<any>(
          { queryKey: ['get-user', user?.id] },
          (old: any) => {
            if (!old?.whiskeys?.items) return old;
            if (old.whiskeys.items.some((it: any) => it?.id === result.id)) return old;
            const newItem = {
              __typename: 'UserWhiskeys',
              id: result.id,
              createdAt: new Date().toISOString(),
              proof: data?.proof ? parseFloat(data.proof) : null,
              proofType: data?.proofType ?? null,
              age: data?.age ?? null,
              archived: false,
              whiskeyId: data.whiskeyId,
              whiskey: { ...cachedWhiskey, type: cachedWhiskey.type ?? [] },
            };
            return {
              ...old,
              whiskeys: {
                ...old.whiskeys,
                items: [newItem, ...old.whiskeys.items],
              },
            };
          }
        );
        // Mark stale without an immediate network refetch, so the next natural
        // view (navigation / pull-to-refresh) reconciles with server truth once,
        // rather than firing a full refetch per add.
        queryClient.invalidateQueries({
          queryKey: ['get-user', user?.id],
          refetchType: 'none',
        });
      } else {
        queryClient.refetchQueries({ queryKey: ['get-user', user?.id] });
      }

      try {
        // Register brand group before event association
        if (cachedWhiskey?.brandUser?.id) groupPostHogBrand(cachedWhiskey.brandUser.id, cachedWhiskey.brandUser.brandName);

        capturePostHogEvent('bottle_added_to_bar', {
          bottle_id: data.whiskeyId,
          brand_id: cachedWhiskey?.brandUser?.id,
          bottle_name: cachedWhiskey?.name,
          brand_name: cachedWhiskey?.brandUser?.brandName,
          source_screen: context?.sourceScreen ?? getCurrentScreenName(),
        }, { brand: cachedWhiskey?.brandUser?.id });

        if (data.rating) {
          capturePostHogEvent('bottle_rated', {
            bottle_id: data.whiskeyId,
            brand_id: cachedWhiskey?.brandUser?.id,
            bottle_name: cachedWhiskey?.name,
            brand_name: cachedWhiskey?.brandUser?.brandName,
            rating: data.rating,
          }, { brand: cachedWhiskey?.brandUser?.id });
        }
      } catch (err) {
        // ignore tracking errors
      }

      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['list-user-rewards'] });
      }, 2000);
      navigation.navigate(nextPage as any);
    },
  });
};

export { useAddWhiskeyToMyCollection };
