import { amplify } from '@services';
import { Guides } from '@types';
import { useQuery } from '@tanstack/react-query';
import { ListGuides } from './query/listGuides';

function useListArticles(tag?: string) {
  return useQuery({
    queryKey: ['list-guides', tag],
    queryFn: async () => {
      const { listGuides } = await amplify.request<{
        listGuides: {
          items: Guides[];
        };
      }>(ListGuides, {
        filter: tag ? { tag: { eq: tag } } : { tag: { ne: '' } },
      });

      return listGuides;
    },
  });
}
export { useListArticles };
