import { amplify } from '@services';
import { searchClubs } from '../../graphql/queries';
import { createLogger } from '../../services/logger';

const logger = createLogger('useCheckClubNameExists');

async function checkClubNameExists(clubName: string): Promise<boolean> {
  const searchName = clubName.trim().toLowerCase();

  try {
    // Use searchClubs which uses OpenSearch/ElasticSearch for better querying
    const response = await amplify.request(searchClubs, {
      filter: {
        searchName: {
          eq: searchName,
        },
      },
      limit: 1,
    });

    const clubs = (response as any)?.searchClubs?.items || [];

    return clubs.length > 0;
  } catch (error) {
    logger.error('Error checking club name:', error as Error);
    // In case of error, return false to allow the user to proceed
    // The backend should do final validation
    return false;
  }
}

export { checkClubNameExists };
