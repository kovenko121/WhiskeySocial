import { getS3Image } from '@helpers';
import { amplify, queryClient } from '@services';
import { AdCampaign, AdType, ImageUrl } from '@types';
import { useQuery } from '@tanstack/react-query';
import { ListAds } from './query/ListAds';

type AdFetched = AdCampaign & {
  adPictureLoaded?: ImageUrl;
};

const fetchSponsoredAd = async () => {
  const { adCampaignsByType } = await amplify.request<{
    adCampaignsByType: { items: AdFetched[] };
  }>(ListAds, {
    type: AdType.SPONSORED,
  });

  const adFetched: AdFetched = {
    ...(adCampaignsByType.items.filter((item: any) => item.isActive)[0] ||
      undefined),
  };

  if (adFetched.picture) {
    const adPicture = await getS3Image(adFetched.picture);
    if (adPicture) {
      adFetched.adPictureLoaded = adPicture;
    }
  }

  return adFetched;
};

const useSponsoredAd = () =>
  useQuery({
    queryKey: ['sponsored-ad'],
    queryFn: fetchSponsoredAd,
  });

const loadSponsoredAd = () => {
  queryClient.fetchQuery({
    queryKey: ['sponsored-ad'],
    queryFn: fetchSponsoredAd,
  });
};

export { loadSponsoredAd, useSponsoredAd };
