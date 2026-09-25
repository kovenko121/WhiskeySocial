import { amplify, queryClient } from '@services';
import { Auth } from 'aws-amplify';
import { getS3Image } from '../helpers';
import { GetUser } from './user/query/getUser';
import { createLogger } from '../services/logger';

const logger = createLogger('loadAuth');

const getMyUser = async (id: any) => {
  try {
    // @ts-ignore  - the way to properly fix and type these requests is through setting up the codegen properly
    const { getUser } = await amplify.request(GetUser, { id });

    if (getUser.profilePicture) {
      const profilePicture = await getS3Image(getUser.profilePicture);
      if (profilePicture) {
        getUser.profilePictureLoaded = profilePicture;
      }
    }
    if (getUser.coverPicture) {
      const coverPicture = await getS3Image(getUser.coverPicture);
      if (coverPicture) {
        getUser.coverPictureLoaded = coverPicture;
      }
    }

    return getUser;
  } catch (error) {
    // If fetching user data fails, log but don't throw
    // This prevents auth loops when the GraphQL query fails
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to fetch user data:', normalizedError);
    return null;
  }
};

// eslint-disable-next-line no-empty-pattern
const loadAuth = async (setAuthState: (state: any) => void) =>
  Auth.currentAuthenticatedUser()
    .then(async (currentUser) => {
      const finishedOnboarding =
        currentUser.attributes['custom:onboarding'] === 'true';

      // Fetch DynamoDB user BEFORE setting auth state so the React Query cache
      // is populated when AuthContext's useEffect runs and calls cioIdentify.
      if (finishedOnboarding) {
        await queryClient.fetchQuery({
          queryKey: ['get-user', currentUser.attributes.sub],
          queryFn: async () => getMyUser(currentUser.attributes.sub),
        });
      }

      setAuthState({
        user: currentUser.attributes,
        finishedOnboarding,
        isAuthenticated: true,
        isGuest: false,
        socialLogin: !!currentUser.attributes?.identities,
      });
    })
    .catch(() =>
      // Preserve isGuest from previous state so that Hub events (token refresh
      // failures, etc.) fired during an active guest session don't silently
      // eject the user from guest mode.
      setAuthState((prev: any) => ({
        ...prev,
        isAuthenticated: false,
        user: {} as any,
        finishedOnboarding: false,
        socialLogin: false,
      }))
    );

export { loadAuth };
