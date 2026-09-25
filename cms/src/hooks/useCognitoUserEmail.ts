import { useState, useEffect } from 'react';
import { useCustomMutation } from '@refinedev/core';
import { createLogger } from '../utils/logger';

const logger = createLogger('useCognitoUserEmail');

interface UseCognitoUserEmailResult {
  email: string | null;
  username: string | null;
  userStatus: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch a Cognito user's email from the App User Pool via GraphQL
 *
 * @param userId - The Cognito user ID (sub/username) from record.owner
 * @returns Object containing email, username, userStatus, loading state, and error
 */
export const useCognitoUserEmail = (
  userId: string | undefined
): UseCognitoUserEmailResult => {
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate } = useCustomMutation();

  useEffect(() => {
    // Reset state if no userId
    if (!userId) {
      setEmail(null);
      setUsername(null);
      setUserStatus(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchEmail = () => {
      setLoading(true);
      setError(null);

      const getCognitoUserQuery = `
        query GetCognitoUserFromUsername($userId: ID!) {
          getCognitoUserFromUsername(userId: $userId) {
            email
            username
            userStatus
          }
        }
      `;

      mutate(
        {
          url: '',
          method: 'post',
          meta: {
            query: getCognitoUserQuery,
            queryName: 'getCognitoUserFromUsername',
            variables: {
              userId,
            },
          },
          values: {},
        },
        {
          onSuccess: (response: any) => {
            if (response.data) {
              setEmail(response.data.email);
              setUsername(response.data.username);
              setUserStatus(response.data.userStatus);
            } else {
              setError('No data returned from query');
            }
            setLoading(false);
          },
          onError: (err: any) => {
            const errorMessage = err?.message || 'Failed to fetch user email';
            logger.error('Error fetching Cognito user email', err instanceof Error ? err : new Error(errorMessage), {
              extra: {
                userId,
                errorMessage,
              },
            });
            setError(errorMessage);
            setEmail(null);
            setUsername(null);
            setUserStatus(null);
            setLoading(false);
          },
        }
      );
    };

    fetchEmail();
  }, [userId]);

  return { email, username, userStatus, loading, error };
};
