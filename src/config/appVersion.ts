import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const APP_VERSION = {
  // Current app version - reads from app.json
  current: Constants.expoConfig?.version || '1.0.0',
  
  // Platform identifier
  platform: Platform.OS === 'ios' ? 'ios' : 'android',
  
  // Store URLs for updates
  storeUrls: {
    ios: 'https://apps.apple.com/app/whiskey-social/id6473649063', // Replace with actual App Store URL
    android: 'https://play.google.com/store/apps/details?id=app.whiskeysocial', // Replace with actual Play Store URL
  },
  
  // Get the native app version from Expo Constants
  nativeVersion: Constants.expoConfig?.version || '1.0.0',
  
  // Get the build number
  buildNumber: Platform.select({
    ios: Constants.expoConfig?.ios?.buildNumber,
    android: Constants.expoConfig?.android?.versionCode?.toString(),
  }),
};

// Helper function to compare version strings
export const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i += 1) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
};

// Check if current version is outdated
export const isVersionOutdated = (currentVersion: string, minimumVersion: string): boolean =>
  compareVersions(currentVersion, minimumVersion) < 0;

// Check if update is available
export const isUpdateAvailable = (currentVersion: string, latestVersion: string): boolean =>
  compareVersions(currentVersion, latestVersion) < 0;
