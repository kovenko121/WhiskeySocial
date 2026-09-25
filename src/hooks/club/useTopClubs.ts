import { amplify } from '@services';
import { Club } from '@types';
import { useQuery } from '@tanstack/react-query';
import { GetTopClubs } from './query/GetTopClubs';
import { createLogger } from '../../services/logger';

const logger = createLogger('useTopClubs');

function useTopClubs(limit: number = 10) {
  return useQuery<Club[]>({
    queryKey: ['top-clubs', limit],
    queryFn: async () => {
      try {
        const response = await amplify.request(GetTopClubs, {
          sort: [
            {
              field: 'memberCount',
              direction: 'desc',
            },
          ],
          limit,
          nextToken: null,
        });
        const searchClubs = (response as any)?.searchClubs;
        if (!searchClubs || !Array.isArray(searchClubs.items)) {
          throw new Error('Malformed response: searchClubs or items missing');
        }
        // Clubs are now sorted server-side by memberCount in descending order via OpenSearch
        return searchClubs.items || [];
      } catch (error) {
        logger.error('Failed to fetch top clubs:', error as Error);
        throw error;
      }
    },
  });
}

export { useTopClubs };
