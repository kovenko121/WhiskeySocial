/* eslint-disable global-require */
import { AuthProvider, LocationProvider } from '@contexts';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { MemoryStorage, urlOpener } from '@helpers';
import { loadAuth, loadFeatureFlags, loadFonts, loadSponsoredAd } from '@hooks';
import { queryClient } from '@services';
import { theme } from '@theme';
import { API, Analytics, Auth, Storage } from 'aws-amplify';
import { PostHogProvider } from 'posthog-react-native';
import { Asset } from 'expo-asset';
import * as Notifications from 'expo-notifications';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { SystemBars } from 'react-native-edge-to-edge';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { Linking, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { EventProvider } from 'react-native-outside-press';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components/native';
import { posthogClient } from './src/config/posthog';
import awsconfig from './src/config/aws';
import { AppUpdateChecker, AppVersionChecker, ErrorBoundary } from './src/components';
import { RewardProvider } from './src/contexts/RewardContext';
import { Routes } from './src/routes';
import { initSentry } from './src/config/sentry';
import { initCustomerIO } from './src/config/customerio';

// Initialize Sentry with best practices configuration
initSentry();
// Initialize Customer.io for lifecycle marketing events
initCustomerIO();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

Notifications.addNotificationResponseReceivedListener((response) => {
  const url = response.notification.request.content.data.deepLink;
  if(typeof url === 'string') {
    Linking.openURL(url);
  }
});

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs(); // Ignore all log notifications
Auth.configure({
  ...awsconfig,
  storage: MemoryStorage,
  oauth: {
    ...awsconfig.oauth,
    urlOpener,
  },
});
Analytics.configure({
  disabled: false,
  autoSessionRecord: true,
  AWSPinpoint: {
    appId: awsconfig.aws_mobile_analytics_app_id,
    region: awsconfig.aws_mobile_analytics_app_region,
    mandatorySignIn: false,
  },
});
Storage.configure({
  bucket: awsconfig.aws_user_files_s3_bucket,
  region: awsconfig.aws_user_files_s3_bucket_region,
  identityPoolId: awsconfig.aws_cognito_identity_pool_id,
});
API.configure(awsconfig);
ExpoSplashScreen.preventAutoHideAsync();
ExpoSplashScreen.setOptions({ fade: true, duration: 250 });
// The native root view is white by default, so it shows through in the gap between the
// splash going away and our first frame landing.
SystemUI.setBackgroundColorAsync(theme.colors.backgroundDark);

export const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [authState, setAuthState] = useState({ isGuest: false });

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([
          loadFonts(),
          loadFeatureFlags(),
          loadAuth(setAuthState),
          loadSponsoredAd(),
          Asset.fromModule(
            require('./assets/images/animation-background.png')
          ).downloadAsync(),
          Asset.fromModule(
            require('./assets/images/animation-crown.png')
          ).downloadAsync(),
        ]);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  // Routes hides the splash once navigation has mounted a real screen. This is only a
  // safety net so a failure to get there can never strand the user on the splash.
  useEffect(() => {
    const timeout = setTimeout(() => ExpoSplashScreen.hideAsync(), 8000);
    return () => clearTimeout(timeout);
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <PostHogProvider
      client={posthogClient}
      autocapture={{ captureScreens: false }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AuthProvider initalValue={authState}>
            <LocationProvider>
              <RewardProvider>
                <GestureHandlerRootView
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.backgroundDark,
                  }}
                >
                  <BottomSheetModalProvider>
                    <EventProvider>
                      <AppVersionChecker>
                        <AppUpdateChecker>
                          <ErrorBoundary>
                            <>
                              <SystemBars
                                style="light"
                                hidden={{
                                  statusBar: false,
                                  navigationBar: false,
                                }}
                              />
                              <Routes />
                            </>
                          </ErrorBoundary>
                        </AppUpdateChecker>
                      </AppVersionChecker>
                    </EventProvider>
                  </BottomSheetModalProvider>
                </GestureHandlerRootView>
              </RewardProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
};
