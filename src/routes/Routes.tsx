/* eslint-disable no-nested-ternary */
import { useAuth, AuthGateProvider } from '@contexts';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  track,
  setArticleFromScreen,
  screenNameFor,
  setCurrentScreenName,
  APP_START_SCREEN_NAME,
} from '@services';
import { Routes } from '@types';
import type { RootStackParams
} from '@types';
import * as Linking from 'expo-linking';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useRef } from 'react';
import * as Sentry from '@sentry/react-native';
import { usePostHog } from 'posthog-react-native';
import { featureFlags } from '../config/featureFlags';
import { HomeScreen } from '../domains/Activity';
import { DeepLinkPostScreen } from '../domains/Activity/components';
import {
  EmailVerificationScreen,
  LoginScreen,
} from '../domains/Auth';
import { AuthLoadingScreen } from '../domains/Auth/AuthLoadingScreen/AuthLoadingScreen';
import {
  AddClubWhiskeyScreen,
  ClubMembersScreen,
  ClubProfileScreen,
  ClubWhiskeyDetailsScreen,
  ClubWhiskeyListScreen,
  EditClubScreen,
  ManageClubUsersScreen,
  ManageClubWhiskeysScreen,
  RequestClubScreen,
} from '../domains/Clubs';
import {
  ArticleScreen,
  ArticlesScreen,
  DiscoverScreen,
  NearbyPlacesScreen,
  SearchScreen,
  TastingEventsScreen,
  UserProfileScreen,
} from '../domains/Discover';
import { NotificationsScreen } from '../domains/Notifications';
import {
  BoothMapScreen,
  DistillerDetailScreen,
  LeaderboardScreen,
  PassportScreen,
} from '../domains/TastingPassport';
import { PersonFormScreen } from '../domains/Onboarding';
import { ReportConfirmationScreen, ReportFormScreen } from '../domains/Report';
import {
  ActiveRewardsScreen,
  RedeemConfirmationScreen,
  ReviewShippingInfoScreen,
  RewardRedeemScreen,
  ShippingInfoScreen,
  TrackingInfoScreen,
} from '../domains/Rewards';
import {
  AccountSettingsScreen,
  ChangeEmailConfirmationScreen,
  ChangeEmailVerification,
  DeleteAccountConfirmationScreen,
  DeleteAccountScreen,
  DeleteAccountWarningScreen,
  NotificationsSettingsScreen,
  SecuritySettingsScreen,
  PrivacySettingsScreen,
  SettingsScreen,
} from '../domains/Settings';
import { MessagesScreen, ConversationScreen } from '../domains/Messaging';
import {
  ClaimingVenueInfoConfirmationScreen,
  ClaimingVenueScreen,
  FollowingFollowersListScreen,
  MyCollectionListScreen,
  MyCollectionScreen,
  PersonProfileEditScreen,
  PourDetails,
  PoursList,
  UserClubsListScreen,
  VenueProfileEditScreen,
  VenueRedeemConfirmationScreen,
} from '../domains/User';
import {
  AddWhiskeyToWishlistScreen,
  BottleDetailsFormScreen,
  BottleDetailsScreen,
  BottleListScreen,
  ConfirmSuggestionScreen,
  ReviewWhiskeyScreen,
  ScanBottleScreen,
  SelectWhiskeyScreen,
  SuggestWhiskeyScreen,
  SuggestionConfirmedScreen,
  WhiskeyInfoScreen,
} from '../domains/Whiskey';
import { useBadgeCount } from '../hooks/useBadgeCount';


const RootStack = createNativeStackNavigator<RootStackParams>();

const BadgeCountSync = () => {
  useBadgeCount();
  return null;
}

// Wrap NavigationContainer with Sentry only when the feature flag is enabled
const SentryNavigationContainer = featureFlags.sentry
  ? Sentry.wrap(NavigationContainer)
  : NavigationContainer;

// Helper to sanitize route parameters for privacy
const sanitizeRouteParams = (params: Record<string, unknown>): Record<string, unknown> => {
  if (!params) return {};

  const sanitized = { ...params };

  // List of sensitive parameter names to redact
  const sensitiveKeys = ['email', 'phone', 'password', 'token', 'code'];

  sensitiveKeys.forEach((key) => {
    if (sanitized[key]) {
      sanitized[key] = '***REDACTED***';
    }
  });

  return sanitized;
};

const RootNavigator = () => {
  const { isAuthenticated, finishedOnboarding, exitGuestMode } = useAuth();
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef('');
  const posthog = usePostHog();

  const linking = {
    prefixes: [
      'whiskeysocial://',
      'https://whiskeysocial.app',
      Linking.createURL('/'),
    ],
    config: {
      screens: {
        Home: 'home',
        MyCollection: 'my-collection',
        UserProfile: 'user/:id/:roll?',
        PostScreen: 'post/:id',
        WhiskeyInfo: 'whiskey/:id',
        Article: 'article/:id',
        ClubProfile: 'club/:clubId',
        Messages: 'messages',
        EmailVerification: 'email-verification/:email/:type/:code',
        Passport: 'passport/:eventId',
        Leaderboard: 'passport/:eventId/leaderboard',
        DistillerDetail: 'passport/:eventId/booth/:boothId',
      },
    },
  };

  const onRouteChange = async () => {
    const previousRouteName = routeNameRef.current;

    const currentRoute = navigationRef.getCurrentRoute();
    const currentRouteName = currentRoute?.name;

    if (previousRouteName !== currentRouteName && currentRouteName) {
      // Screen analytics are keyed on the stable name from the registry, never on the
      // route name, so renaming or moving a route leaves every trend line intact (WHI-217).
      const currentScreenName = screenNameFor(currentRouteName);
      setCurrentScreenName(currentScreenName);

      track(`enter${currentScreenName}Screen`);

      // Get route parameters (sanitized for privacy)
      const params = (currentRoute?.params as Record<string, unknown>) || {};
      const sanitizedParams = sanitizeRouteParams(params);

      // Map common params to PostHog expected snake_case properties
      const posthogParams: { [key: string]: any } = {
        from_screen: previousRouteName
          ? screenNameFor(previousRouteName)
          : APP_START_SCREEN_NAME,
        route_name: currentRouteName,
        ...sanitizedParams,
      };

      // PostHog screen tracking.
      // The Article screen fires its own $screen event from the component so it
      // can include the human-readable `title` (only available after the
      // article data loads). Hand off `from_screen` and skip it here to avoid
      // double-counting the event (WHI-130).
      if (currentRouteName === Routes.Article) {
        setArticleFromScreen(posthogParams.from_screen);
      } else {
        posthog.screen(currentScreenName, posthogParams);
      }

      if (featureFlags.sentry) {
        Sentry.addBreadcrumb({
          category: 'navigation',
          message: `Navigated to ${currentRouteName}`,
          level: 'info',
          data: {
            from: previousRouteName || 'app_start',
            to: currentRouteName,
            params: sanitizedParams,
          },
        });

        Sentry.setTag('screen', currentRouteName);

        if (sanitizedParams.id) {
          Sentry.setTag('route.id', sanitizedParams.id as string);
        }
        if (sanitizedParams.roll) {
          Sentry.setTag('route.roll', sanitizedParams.roll as string);
        }
        if (sanitizedParams.type) {
          Sentry.setTag('route.type', sanitizedParams.type as string);
        }
      }
    }

    routeNameRef.current = currentRouteName || '';
  };

  const onRouteReady = () => {
    routeNameRef.current = navigationRef.getCurrentRoute()!.name;
    setCurrentScreenName(screenNameFor(routeNameRef.current));

    // With `linking` enabled the container renders nothing until it has resolved the
    // initial URL, so this is the first moment a real screen exists to hand over to.
    ExpoSplashScreen.hideAsync();
  };

  return (
    <>
    {isAuthenticated && finishedOnboarding && <BadgeCountSync />}
    <SentryNavigationContainer
      ref={navigationRef}
      onReady={onRouteReady}
      onStateChange={onRouteChange}
      linking={linking}
    >
      <AuthGateProvider onLogin={() => { exitGuestMode(); navigationRef.current?.navigate(Routes.Login); }}>
      <RootStack.Navigator>
        {!isAuthenticated ? (
          <RootStack.Group
            navigationKey="Unauthenticated"
            screenOptions={{ headerShown: false }}
          >
            <RootStack.Screen name={Routes.Login} component={LoginScreen} />
            <RootStack.Screen
              name={Routes.AuthLoading}
              component={AuthLoadingScreen}
            />
            <RootStack.Screen
              name={Routes.EmailVerification}
              component={EmailVerificationScreen}
              options={{ animation: 'fade' }}
            />
            <RootStack.Screen
              name={Routes.NearbyPlaces}
              component={NearbyPlacesScreen}
              options={{ animation: 'fade' }}
            />
            <RootStack.Screen
              name={Routes.Discover}
              component={DiscoverScreen}
              options={{ animation: 'fade' }}
            />
            <RootStack.Screen
              name={Routes.Search}
              component={SearchScreen}
              options={{ animation: 'fade_from_bottom' }}
            />
            <RootStack.Screen
              name={Routes.UserProfile}
              component={UserProfileScreen}
              options={{ animation: 'fade' }}
            />
            <RootStack.Screen
              name={Routes.TastingEvents}
              component={TastingEventsScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </RootStack.Group>
        ) : !finishedOnboarding ? (
          <RootStack.Group
            navigationKey="Onboarding"
            screenOptions={{ headerShown: false }}
          >
            <RootStack.Screen name={Routes.PersonForm} component={PersonFormScreen} />
          </RootStack.Group>
        ) : (
          <>
            {/* Activity */}
            <RootStack.Group
              navigationKey="Activity"
              screenOptions={{ headerShown: false }}
            >
              <RootStack.Screen
                name={Routes.AuthLoading}
                component={AuthLoadingScreen}
                options={{ animation: 'none' }}
                initialParams={{ time: 3800 }}
              />
              <RootStack.Screen
                name={Routes.Home}
                component={HomeScreen}
                options={{
                  animation: 'fade',
                  gestureEnabled: false,
                }}
              />
              <RootStack.Screen
                name={Routes.PostScreen}
                component={DeepLinkPostScreen}
                options={{ animation: 'fade' }}
              />
            </RootStack.Group>

            {/* Clubs */}
            <RootStack.Group
              navigationKey="Clubs"
              screenOptions={{ headerShown: false }}
            >
              <RootStack.Screen
                name={Routes.ClubProfile}
                component={ClubProfileScreen}
                options={{ animation: 'fade' }}
              />
              <RootStack.Screen
                name={Routes.RequestClub}
                component={RequestClubScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <RootStack.Screen
                name={Routes.EditClub}
                component={EditClubScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <RootStack.Screen
                name={Routes.ClubMembers}
                component={ClubMembersScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <RootStack.Screen
                name={Routes.ManageClubUsers}
                component={ManageClubUsersScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <RootStack.Screen
                name={Routes.ManageClubWhiskeys}
                component={ManageClubWhiskeysScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <RootStack.Screen
                name={Routes.AddClubWhiskey}
                component={AddClubWhiskeyScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <RootStack.Screen
                name={Routes.ClubWhiskeyList}
                component={ClubWhiskeyListScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <RootStack.Screen
                name={Routes.ClubWhiskeyDetails}
                component={ClubWhiskeyDetailsScreen}
                options={{ animation: 'slide_from_right' }}
              />
            </RootStack.Group>

            {/* Rewards */}
            <RootStack.Group
              navigationKey="Rewards"
              screenOptions={{ headerShown: false }}
            >
              <RootStack.Screen
                name={Routes.RedeemConfirmation}
                component={RedeemConfirmationScreen}
                options={{ animation: 'fade' }}
              />
              <RootStack.Screen
                name={Routes.ReviewShippingInfo}
                component={ReviewShippingInfoScreen}
                options={{ animation: 'fade' }}
              />
              <RootStack.Screen
                name={Routes.RewardRedeem}
                component={RewardRedeemScreen}
                options={{ animation: 'fade' }}
              />
              <RootStack.Screen
                name={Routes.ShippingInfo}
                component={ShippingInfoScreen}
                options={{ animation: 'fade' }}
              />
              <RootStack.Screen
                name={Routes.TrackingInfo}
                component={TrackingInfoScreen}
                options={{ animation: 'fade' }}
              />
              <RootStack.Screen
                name={Routes.ActiveRewards}
                component={ActiveRewardsScreen}
                options={{ animation: 'fade' }}
              />
            </RootStack.Group>

            {/* MyCollection */}
            <RootStack.Group
              navigationKey="MyCollection"
              screenOptions={{ headerShown: false }}
            >
              <RootStack.Screen
                name={Routes.MyCollection}
                component={MyCollectionScreen}
                options={{ animation: 'fade' }}
              />
              <RootStack.Screen name={Routes.PoursList} component={PoursList} />
              <RootStack.Screen name={Routes.PourDetails} component={PourDetails} />
              <RootStack.Screen
                name={Routes.PersonProfileEdit}
                component={PersonProfileEditScreen}
              />
              <RootStack.Screen
                name={Routes.VenueProfileEdit}
                component={VenueProfileEditScreen}
              />
              <RootStack.Screen
                name={Routes.FollowingFollowersList}
                component={FollowingFollowersListScreen}
              />
              <RootStack.Screen
                name={Routes.UserClubsList}
                component={UserClubsListScreen}
              />
              <RootStack.Screen
                name={Routes.Notifications}
                component={NotificationsScreen}
              />
              <RootStack.Screen
                name={Routes.MyCollectionList}
                component={MyCollectionListScreen}
              />
            </RootStack.Group>

            {/* Discover */}
            <RootStack.Group
              navigationKey="Discover"
              screenOptions={{ headerShown: false }}
            >
              <RootStack.Screen
                name={Routes.Discover}
                component={DiscoverScreen}
                options={{ animation: 'fade' }}
              />
              <RootStack.Screen
                name={Routes.Search}
                component={SearchScreen}
                options={{ animation: 'fade_from_bottom' }}
              />
              <RootStack.Screen name={Routes.Articles} component={ArticlesScreen} />
              <RootStack.Screen name={Routes.Article} component={ArticleScreen} />
              <RootStack.Screen
                name={Routes.NearbyPlaces}
                component={NearbyPlacesScreen}
                options={{ animation: 'fade' }}
              />
              <RootStack.Screen
                name={Routes.UserProfile}
                component={UserProfileScreen}
                options={{ animation: 'fade' }}
              />
              <RootStack.Screen
                name={Routes.ClaimingVenue}
                component={ClaimingVenueScreen}
              />
              <RootStack.Screen
                name={Routes.ClaimingVenueInfoConfirmation}
                component={ClaimingVenueInfoConfirmationScreen}
              />
              <RootStack.Screen
                name={Routes.VenueRedeemConfirmation}
                component={VenueRedeemConfirmationScreen}
                options={{ gestureEnabled: false }}
              />
              <RootStack.Screen
                name={Routes.TastingEvents}
                component={TastingEventsScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <RootStack.Screen
                name={Routes.Passport}
                component={PassportScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <RootStack.Screen
                name={Routes.DistillerDetail}
                component={DistillerDetailScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <RootStack.Screen
                name={Routes.Leaderboard}
                component={LeaderboardScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <RootStack.Screen
                name={Routes.BoothMap}
                component={BoothMapScreen}
                options={{ animation: 'slide_from_right' }}
              />
            </RootStack.Group>

            {/* Messages */}
            <RootStack.Group
              navigationKey="Messages"
              screenOptions={{ headerShown: false }}
            >
              <RootStack.Screen
                name={Routes.Messages}
                component={MessagesScreen}
              />
              <RootStack.Screen
                name={Routes.Conversation}
                component={ConversationScreen}
              />
            </RootStack.Group>

            {/* Settings */}
            <RootStack.Group
              navigationKey="Settings"
              screenOptions={{ headerShown: false }}
            >
              <RootStack.Screen name={Routes.Settings} component={SettingsScreen} />
              <RootStack.Screen
                name={Routes.NotificationsSettings}
                component={NotificationsSettingsScreen}
              />
              <RootStack.Screen
                name={Routes.AccountSettings}
                component={AccountSettingsScreen}
              />
              <RootStack.Screen
                name={Routes.ChangeEmailVerification}
                component={ChangeEmailVerification}
              />
              <RootStack.Screen
                name={Routes.ChangeEmailConfirmation}
                component={ChangeEmailConfirmationScreen}
              />
              <RootStack.Screen
                name={Routes.PrivacySettings}
                component={PrivacySettingsScreen}
              />
              <RootStack.Screen
                name={Routes.SecuritySettings}
                component={SecuritySettingsScreen}
              />
              <RootStack.Screen
                name={Routes.DeleteAccount}
                component={DeleteAccountScreen}
                options={{ animation: 'fade' }}
              />
              <RootStack.Screen
                name={Routes.DeleteAccountWarning}
                component={DeleteAccountWarningScreen}
                options={{ animation: 'fade' }}
              />
              <RootStack.Screen
                name={Routes.DeleteAccountConfirmation}
                component={DeleteAccountConfirmationScreen}
                options={{ animation: 'fade' }}
              />
            </RootStack.Group>

            {/* Whiskey */}
            <RootStack.Group
              navigationKey="AddWhiskey"
              screenOptions={{ headerShown: false }}
            >
              <RootStack.Screen
                name={Routes.SelectWhiskey}
                component={SelectWhiskeyScreen}
                options={{ animation: 'fade' }}
              />

              <RootStack.Screen
                name={Routes.WhiskeyInfo}
                component={WhiskeyInfoScreen}
              />

              <RootStack.Screen
                name={Routes.ReviewWhiskey}
                component={ReviewWhiskeyScreen}
              />

              <RootStack.Screen
                name={Routes.SuggestWhiskey}
                component={SuggestWhiskeyScreen}
              />

              <RootStack.Screen
                name={Routes.ScanBottle}
                component={ScanBottleScreen}
              />

              <RootStack.Screen
                name={Routes.AddWhiskeyToWishlist}
                component={AddWhiskeyToWishlistScreen}
                options={{ animation: 'fade' }}
              />

              <RootStack.Screen
                name={Routes.ConfirmSuggestion}
                component={ConfirmSuggestionScreen}
              />

              <RootStack.Screen
                name={Routes.SuggestionConfirmed}
                component={SuggestionConfirmedScreen}
              />

              <RootStack.Screen
                name={Routes.BottleDetailsForm}
                component={BottleDetailsFormScreen}
              />

              <RootStack.Screen
                name={Routes.BottleDetails}
                component={BottleDetailsScreen}
              />

              <RootStack.Screen
                name={Routes.BottleList}
                component={BottleListScreen}
              />
            </RootStack.Group>

            {/* Report */}
            <RootStack.Group
              navigationKey="Report"
              screenOptions={{ headerShown: false }}
            >
              <RootStack.Screen
                name={Routes.ReportConfirmation}
                component={ReportConfirmationScreen}
              />
              <RootStack.Screen
                name={Routes.ReportForm}
                component={ReportFormScreen}
              />
            </RootStack.Group>
          </>
        )}
      </RootStack.Navigator>
      </AuthGateProvider>
    </SentryNavigationContainer>
    </>
  );
};

export { RootNavigator as Routes };
