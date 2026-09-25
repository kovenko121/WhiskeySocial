import { getS3Image } from '@helpers';
import { amplify } from '@services';
import { Guides, S3Object } from '@types';
import { useQuery } from '@tanstack/react-query';
import { GetGuide } from './query/getGuide';

function useGetArticle(id: string) {
  return useQuery<Guides>({
    queryKey: ['get-guide', id],
    queryFn: async () => {
      const { getGuides } = await amplify.request<{ getGuides: any }>(GetGuide, {
        id,
      });

      if (getGuides.coverPhoto) {
        getGuides.coverPhoto = await getS3Image(getGuides.coverPhoto);
      }

      if (getGuides.photos) {
        getGuides.photos = await Promise.all(
          getGuides.photos.map(async (photo: S3Object | null) =>
            photo ? getS3Image(photo) : false
          )
        );
      }

      return getGuides;
    },
  });
}

export { useGetArticle };
