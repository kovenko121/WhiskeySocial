import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('useTokenManager');

export const useTokenManager = () => {
  const { data: session, status } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate extended session info
  const tokenInfo = session?.idToken ? {
    ...session,
    hasToken: true,
    isExpiring: session.tokenExpires ? (session.tokenExpires - Date.now()) < 600000 : false, // 10min buffer like NextAuth
    expiresIn: session.tokenExpires ? Math.max(0, session.tokenExpires - Date.now()) : 0,
    hasAdminAccess: session.groups?.includes('Admin') || false,
  } : null;

  const forceRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force NextAuth to refresh by fetching new session
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      const newSession = await response.json();

      if (newSession?.error === 'RefreshAccessTokenError' || !newSession?.idToken) {
        await handleAuthError();
        return false;
      }

      // NextAuth will automatically update the session
      return true;
    } catch (error) {
      logger.error('Force refresh failed', error instanceof Error ? error : new Error(String(error)), {
        extra: {
          timestamp: new Date().toISOString(),
          sessionExists: !!session,
        },
      });
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAuthError = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: '/login',
      });
    } catch (error) {
      // Force redirect if signOut fails
      window.location.href = '/login';
    }
  };

  return {
    tokenInfo,
    isRefreshing,
    forceRefresh,
    handleAuthError,
    isAuthenticated: status === 'authenticated',
    session,
  };
};