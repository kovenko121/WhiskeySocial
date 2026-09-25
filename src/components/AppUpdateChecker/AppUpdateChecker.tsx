import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';
import { createLogger } from '../../services/logger';

const logger = createLogger('AppUpdateChecker');

// Long enough that a restart reads as the app having relaunched rather than
// glitched, since a reload drops the user back on the initial route.
const MINIMUM_BACKGROUND_MS = 15 * 60 * 1000;
const INITIAL_CHECK_DELAY_MS = 3000;

interface AppUpdateCheckerProps {
  children: React.ReactNode;
}

const AppUpdateChecker: React.FC<AppUpdateCheckerProps> = ({ children }) => {
  const isFetchingRef = useRef(false);
  const isUpdateStagedRef = useRef(false);
  const backgroundedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const stagePendingUpdate = async () => {
      if (
        __DEV__ ||
        !Updates.isEnabled ||
        isFetchingRef.current ||
        isUpdateStagedRef.current
      ) {
        return;
      }

      isFetchingRef.current = true;

      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          const fetched = await Updates.fetchUpdateAsync();
          isUpdateStagedRef.current = fetched.isNew || fetched.isRollBackToEmbedded;
        }
      } catch (error) {
        logger.error('Error staging update', error as Error);
      } finally {
        isFetchingRef.current = false;
      }
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        backgroundedAtRef.current = Date.now();
        return;
      }

      if (nextAppState !== 'active') {
        return;
      }

      // iOS returns from the background as background -> inactive -> active, so
      // the previous state is an unreliable signal. The timestamp is the honest
      // one: Control Center and permission dialogs only blip through 'inactive'
      // without ever reaching 'background', so it stays unset for those.
      const backgroundedAt = backgroundedAtRef.current;
      backgroundedAtRef.current = null;

      if (backgroundedAt === null) {
        return;
      }

      const wasAwayLongEnough = Date.now() - backgroundedAt >= MINIMUM_BACKGROUND_MS;

      if (isUpdateStagedRef.current && wasAwayLongEnough) {
        // Nothing meaningful can follow this: the promise resolves once the
        // reload is queued, not once it has happened.
        Updates.reloadAsync().catch(error => {
          logger.error('Error reloading into the staged update', error as Error);
        });
        return;
      }

      stagePendingUpdate();
    };

    const initialCheckTimeout = setTimeout(stagePendingUpdate, INITIAL_CHECK_DELAY_MS);
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearTimeout(initialCheckTimeout);
      subscription.remove();
    };
  }, []);

  return children;
};

export { AppUpdateChecker };
