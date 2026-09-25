import { StackNavigationProp } from '@react-navigation/native-stack';
import { ImageSourcePropType } from 'react-native';
import { ProofType, ReportContentType, S3Object, UserType } from './api';
import { CodeOperations } from './auth';

type ShippingInfo = {
  rewardId: string;
  shirtSize: string | undefined;
  shirtModel: string | undefined;
  fullName: string;
  email: string;
  addressFirst: string;
  addressSecond?: string;
  cityName: string;
  stateName: string;
  zipcode: string;
};

export type RootStackParams = {
  // Auth
  Login: undefined;
  EmailVerification: {
    email: string;
    type: CodeOperations;
    code?: string;
  };
  AuthLoading: {
    time?: number | undefined;
  };

  // Onboarding
  PersonForm: undefined;

  // MyCollection
  MyCollection: undefined;
  PersonProfileEdit: undefined;
  VenueProfileEdit: undefined;
  PoursList: {
    userId: string;
  };
  PourDetails: {
    id: string;
    userId: string;
  };
  FollowingFollowersList: {
    userId: string;
    username: string;
    openWith: string;
  };
  UserClubsList: {
    userId: string;
    username: string;
  };
  Notifications: undefined;
  MyCollectionList: { userId: string };
  ClaimingVenue: { venueId: string };
  VenueRedeemConfirmation: { venueId: string };
  UserProfile: {
    id: string;
    roll?: string | undefined;
  };
  ClaimingVenueInfoConfirmation: {
    fullName: string;
    email: string;
    phone: string;
    countryCode: string | undefined;
    venueId: string;
  };

  // Discovery
  Discover: undefined;
  Articles: undefined;
  Article: {
    id: string;
  };
  NearbyPlaces: undefined;
  Search: {
    category?: string | undefined | null;
  };

  // Tasting Passport
  TastingEvents: undefined;
  Passport: {
    eventId: string;
  };
  DistillerDetail: {
    eventId: string;
    boothId: string;
  };
  Leaderboard: {
    eventId: string;
  };
  BoothMap: { eventId: string };

  // Venue Section
  VenueSection: undefined;

  // Settings
  Settings: undefined;
  NotificationsSettings: undefined;
  AccountSettings: undefined;
  ChangeEmailVerification: {
    email: string;
  };
  ChangeEmailConfirmation: undefined;
  PrivacySettings: undefined;
  SecuritySettings: undefined;

  // Messages
  Messages: {
    initialTab?: string;
  } | undefined;
  Conversation: {
    conversationId: string;
    recipientId: string;
    recipientName?: string;
    recipientImage?: any;
    requestStatus?: string;
    participantId?: string;
    isMuted?: boolean;
  };
  DeleteAccount: undefined;
  DeleteAccountWarning: undefined;
  DeleteAccountConfirmation: undefined;

  // Whiskey
  SelectWhiskey: {
    myUserType: UserType;
    myWhiskeysIds: string[];
  };
  ScanBottle: {
    imageUri: string;
    myUserType?: UserType;
    intent?: 'add' | 'view';
  };
  WhiskeyInfo: {
    id: string;
  };
  ReviewWhiskey: {
    whiskey: {
      id: string;
      name: string;
      batch?: string;
      bottle?: string;
      proof?: string | null;
      proofType?: ProofType;
      barrel?: string;
      rick?: string;
      warehouse?: string;
      storePick?: string;
      purchaseYear?: string;
      notes?: string;
    };
    fromPost?: boolean;
    remainingWhiskeys?: Array<{ id: string; name: string }>;
    existingReview?: {
      id: string;
      rating: number;
      title?: string | null;
      description?: string | null;
      recommendationTags?: string[] | null;
      specialistReview?: number | null;
    };
  };
  SuggestWhiskey:
    | {
        brand?: string;
        name?: string;
        years?: string;
        imageUri?: string;
      }
    | undefined;
  SuggestionConfirmed: undefined;
  ConfirmSuggestion: {
    whiskeyPicture: any;
    name: string;
    brand: string;
    years: string;
    barcode: string;
  };
  AddWhiskeyToWishlist: undefined;
  BottleDetails: {
    bottleId: string;
    myUser: any;
  };
  BottleDetailsForm: {
    whiskey: any;
    bottle?: any | undefined;
    from?: any;
  };
  BottleList: {
    id: string;
  };

  // Activity
  Home: undefined;
  PostScreen: {
    id: string;
  };

  // Clubs
  ClubProfile: {
    clubId: string;
  };
  RequestClub: undefined;
  EditClub: {
    clubId: string;
  };
  ClubMembers: {
    clubId: string;
  };
  ManageClubUsers: {
    clubId: string;
  };
  ManageClubWhiskeys: {
    clubId: string;
    clubName: string;
  };
  AddClubWhiskey: {
    clubId: string;
    clubName: string;
    existingWhiskeyIds: string[];
  };
  ClubWhiskeyList: {
    clubId: string;
    clubName: string;
  };
  ClubWhiskeyDetails: {
    clubWhiskeyId: string;
    whiskeyId: string;
    clubId: string;
    clubName: string;
    notes?: string | null;
    addedAt: string;
    isAdmin: boolean;
  };

  // Reward
  RedeemConfirmation: undefined;
  ReviewShippingInfo: ShippingInfo;
  RewardRedeem: {
    rewardImage: S3Object | null | undefined;
    rewardTitle: string | null | undefined;
    rewardId: string;
    isTshirt: boolean;
    sizes: Array<string | null> | null | undefined;
    models: Array<string | null> | null | undefined;
  };
  ShippingInfo: {
    rewardId: string;
    isTshirt: boolean;
    sizes: Array<string | null> | null | undefined;
    models: Array<string | null> | null | undefined;
  };
  TrackingInfo: {
    trackingCode: string | null | undefined;
    service: string | null | undefined;
    address: string | null | undefined;
    shirtSize: string | null | undefined;
    shirtModel: string | null | undefined;
    rewardImage: ImageSourcePropType | undefined;
  };
  ActiveRewards: undefined;

  // Report
  ReportConfirmation: {
    contentId: string;
    contentType: ReportContentType;
    reportedUserId: string;
    ownerName: string;
    reason: string;
    description?: string;
    from: any;
  };
  ReportForm: {
    contentId: string;
    contentType: ReportContentType;
    reportedUserId: string;
    from: any;
  };
};

export type NavigationProps = StackNavigationProp<RootStackParams>;

export const Routes = {
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
  ScanBottle: 'ScanBottle',
  WhiskeyInfo: 'WhiskeyInfo',
  ReviewWhiskey: 'ReviewWhiskey',
  SuggestWhiskey: 'SuggestWhiskey',
  SuggestionConfirmed: 'SuggestionConfirmed',
  ConfirmSuggestion: 'ConfirmSuggestion',
  AddWhiskeyToWishlist: 'AddWhiskeyToWishlist',
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
} as const satisfies Record<keyof RootStackParams, keyof RootStackParams>;
