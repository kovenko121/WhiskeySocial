import { useQuery } from '@tanstack/react-query';
import { amplifyApiKey } from '@services';
import { APP_VERSION, isVersionOutdated, isUpdateAvailable } from '../../config/appVersion';
import { GetAppVersion } from './query/getAppVersion';
import { createLogger } from '../../services/logger';

const logger = createLogger('useAppVersion');

interface AppVersionInfo {
  id: string;
  platform: string;
  currentVersion: string;
  minimumVersion: string;
  createdAt: string;
  updatedAt: string;
}

interface AppVersionCheckResult {
  needsUpdate: boolean;
  forceUpdate: boolean;
  updateUrl?: string;
  currentVersion: string;
  latestVersion?: string;
  minimumVersion?: string;
}

function useAppVersion() {
  return useQuery<AppVersionCheckResult>({
    queryKey: ['app-version-check', APP_VERSION.platform],
    queryFn: async () => {
      logger.info('Starting version check...');
      logger.info(`Local version: ${APP_VERSION.current}`);
      logger.info(`Platform: ${APP_VERSION.platform}`);

      try {
        const filter = {
          or: [
            { platform: { eq: APP_VERSION.platform } },
            { platform: { eq: 'all' } },
          ],
        };

        const { listAppVersions } = await amplifyApiKey.request<{
          listAppVersions: { items: AppVersionInfo[] };
        }>(GetAppVersion, {
          filter,
          limit: 3,
        });

        const items = listAppVersions?.items || [];
        const versionInfo =
          items.find(item => item.platform === APP_VERSION.platform) ||
          items.find(item => item.platform === 'all');

        if (!versionInfo) {
          logger.warn('No version info found on server');
          // No version info found, app can continue normally
          return {
            needsUpdate: false,
            forceUpdate: false,
            currentVersion: APP_VERSION.current,
          };
        }

        logger.info(`Server response: platform=${versionInfo.platform}, currentVersion=${versionInfo.currentVersion}, minimumVersion=${versionInfo.minimumVersion}`);

        const isOutdated = isVersionOutdated(
          APP_VERSION.current,
          versionInfo.minimumVersion
        );
        const hasUpdate = isUpdateAvailable(
          APP_VERSION.current,
          versionInfo.currentVersion
        );

        logger.info(`Version comparison: localVersion=${APP_VERSION.current}, serverVersion=${versionInfo.currentVersion}, minimumVersion=${versionInfo.minimumVersion}, isOutdated=${isOutdated}, hasUpdate=${hasUpdate}, needsUpdate=${isOutdated || hasUpdate}, forceUpdate=${isOutdated}`);

        return {
          needsUpdate: isOutdated || hasUpdate,
          forceUpdate: isOutdated, // Force update only if below minimum version
          updateUrl: APP_VERSION.storeUrls[APP_VERSION.platform as keyof typeof APP_VERSION.storeUrls],
          currentVersion: APP_VERSION.current,
          latestVersion: versionInfo.currentVersion,
          minimumVersion: versionInfo.minimumVersion,
        };
      } catch (error) {
        logger.error('Error checking version:', error as Error);
        // On error, allow app to continue
        return {
          needsUpdate: false,
          forceUpdate: false,
          currentVersion: APP_VERSION.current,
        };
      }
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour (renamed from cacheTime)
    retry: 1, // Only retry once on failure
    retryDelay: 5000, // Wait 5 seconds before retry
  });
}

export { useAppVersion };
export type { AppVersionCheckResult };