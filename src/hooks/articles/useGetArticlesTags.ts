import { useAuth } from '@contexts';
import { amplify } from '@services';
import { ModelGuideTagsConnection } from '@types';
import { useQuery } from '@tanstack/react-query';
import { GetGuidesTags } from './query/getGuidesTags';

function useGetArticlesTags() {
  const { isGuest } = useAuth();

  return useQuery<ModelGuideTagsConnection>({
    queryKey: ['get-guides-tags'],
    enabled: !isGuest,
    queryFn: async () => {
      const { listGuideTags } = await amplify.request<{
        listGuideTags: ModelGuideTagsConnection;
      }>(GetGuidesTags);

      return listGuideTags;
    },
  });
}
export { useGetArticlesTags };
