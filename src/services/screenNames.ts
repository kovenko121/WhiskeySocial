// Analytics identities, not route names: never change a value here when a route is
// renamed or moved — see Docs/ANALYTICS_SCREEN_NAMES.md.
import { RootStackParams } from '../types/router';

export const SCREEN_NAMES = {
  // Auth
  Login: 'Login',
  EmailVerification: 'EmailVerification',
  AuthLoading: 'AuthLoading',
  // Onboarding
  PersonForm: 'PersonForm',
  // MyCollection
  MyCollection: 'MyCollection',
  PersonProfileEdit: 'PersonProfileEdit',
  VenueProfileEdit: 'VenueProfileEdit',
  PoursList: 'PoursList',
  PourDetails: 'PourDetails',
  FollowingFollowersList: 'FollowingFollowersList',
  UserClubsList: 'UserClubsList',
  Notifications: 'Notifications',
  MyCollectionList: 'MyCollectionList',
  ClaimingVenue: 'ClaimingVenue',
  VenueRedeemConfirmation: 'VenueRedeemConfirmation',
  UserProfile: 'UserProfile',
  ClaimingVenueInfoConfirmation: 'ClaimingVenueInfoConfirmation',
  // Discovery
  Discover: 'Discover',
  Articles: 'Articles',
  Article: 'Article',
  NearbyPlaces: 'NearbyPlaces',
  Search: 'Search',
  // Tasting Passport
  TastingEvents: 'TastingEvents',
  Passport: 'Passport',
  DistillerDetail: 'DistillerDetail',
  Leaderboard: 'Leaderboard',
  BoothMap: 'BoothMap',
  VenueSection: 'VenueSection',
  // Settings
  Settings: 'Settings',
  NotificationsSettings: 'NotificationsSettings',
  AccountSettings: 'AccountSettings',
  ChangeEmailVerification: 'ChangeEmailVerification',
  ChangeEmailConfirmation: 'ChangeEmailConfirmation',
  PrivacySettings: 'PrivacySettings',
  SecuritySettings: 'SecuritySettings',
  // Messages
  Messages: 'Messages',
  Conversation: 'Conversation',
  // Account
  DeleteAccount: 'DeleteAccount',
  DeleteAccountWarning: 'DeleteAccountWarning',
  DeleteAccountConfirmation: 'DeleteAccountConfirmation',
  // Whiskey
  SelectWhiskey: 'SelectWhiskey',
  WhiskeyInfo: 'WhiskeyInfo',
  ReviewWhiskey: 'ReviewWhiskey',
  SuggestWhiskey: 'SuggestWhiskey',
  SuggestionConfirmed: 'SuggestionConfirmed',
  ConfirmSuggestion: 'ConfirmSuggestion',
  AddWhiskeyToWishlist: 'AddWhiskeyToWishlist',
  ScanBottle: 'ScanBottle',
  BottleDetails: 'BottleDetails',
  BottleDetailsForm: 'BottleDetailsForm',
  BottleList: 'BottleList',
  // Activity
  Home: 'Home',
  PostScreen: 'PostScreen',
  // Clubs
  ClubProfile: 'ClubProfile',
  RequestClub: 'RequestClub',
  EditClub: 'EditClub',
  ClubMembers: 'ClubMembers',
  ManageClubUsers: 'ManageClubUsers',
  ManageClubWhiskeys: 'ManageClubWhiskeys',
  AddClubWhiskey: 'AddClubWhiskey',
  ClubWhiskeyList: 'ClubWhiskeyList',
  ClubWhiskeyDetails: 'ClubWhiskeyDetails',
  // Rewards
  RedeemConfirmation: 'RedeemConfirmation',
  ReviewShippingInfo: 'ReviewShippingInfo',
  RewardRedeem: 'RewardRedeem',
  ShippingInfo: 'ShippingInfo',
  TrackingInfo: 'TrackingInfo',
  ActiveRewards: 'ActiveRewards',
  // Report
  ReportConfirmation: 'ReportConfirmation',
  ReportForm: 'ReportForm',
} as const satisfies Record<keyof RootStackParams, string>;

export type ScreenName = (typeof SCREEN_NAMES)[keyof typeof SCREEN_NAMES];

export const APP_START_SCREEN_NAME = 'app_start';

export const UNKNOWN_SCREEN_NAME = 'unknown';

export const screenNameFor = (routeName?: string | null): string => {
  if (!routeName) return UNKNOWN_SCREEN_NAME;
  return SCREEN_NAMES[routeName as keyof typeof SCREEN_NAMES] ?? routeName;
};

let currentScreenName: string = APP_START_SCREEN_NAME;

export const setCurrentScreenName = (name: string) => {
  currentScreenName = name;
};

export const getCurrentScreenName = () => currentScreenName;
