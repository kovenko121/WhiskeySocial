import { amplify } from '@services';
import { AdCampaign, AdType } from '@types';
import { useQuery } from '@tanstack/react-query';
import { ListAds } from './query/ListAds';

function useAdsByType(type: AdType) {
  return useQuery({
    queryKey: ['list-ads', type],
    queryFn: async () => {
      const { adCampaignsByType } = await amplify.request<{
        adCampaignsByType: { items: AdCampaign[] };
      }>(ListAds, {
        type,
      });

      return adCampaignsByType;
    },
  });
}

export { useAdsByType };
