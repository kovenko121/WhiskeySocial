import { useAuth } from '@contexts';
import { useQuery } from '@tanstack/react-query';
import { Auth } from 'aws-amplify';
import { createLogger } from '../../services/logger';

const logger = createLogger('useIsAdmin');

const ADMIN_GROUP = 'Admin';

const readGroups = async (): Promise<string[]> => {
  try {
    const session = await Auth.currentSession();
    const groups = session.getIdToken().decodePayload()['cognito:groups'];
    return Array.isArray(groups) ? groups : [];
  } catch (error) {
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));
    logger.info('Could not read Cognito groups:', { extra: normalizedError });
    return [];
  }
};

/**
 * Whether the signed-in account is in the app's Cognito `Admin` group.
 *
 * Group membership rides in the id token rather than the attribute bag `useAuth`
 * exposes, so it is read from the session here. A guest, a failed read, or a token
 * with no groups claim all resolve to false: this decides whether unpublished
 * content is shown, so the answer it falls back to has to be the closed one.
 *
 * Keyed on the account so signing out of an admin and into a member cannot leave the
 * previous verdict cached against the new session.
 */
export const useIsAdmin = (): boolean => {
  const { isGuest, user } = useAuth();
  const sub: string | undefined = user?.sub;

  const { data } = useQuery({
    queryKey: ['cognito-groups', sub ?? 'guest'],
    queryFn: readGroups,
    enabled: !isGuest && !!sub,
    staleTime: 5 * 60 * 1000,
  });

  return (data ?? []).includes(ADMIN_GROUP);
};
