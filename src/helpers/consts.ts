import { Platform, StatusBar } from 'react-native';

export const isIos = Platform.OS === 'ios';

export const isAndroid = Platform.OS === 'android';

export const androidTop: number = isIos ? 70 : StatusBar.currentHeight || 0;

export const BUNDLE_ID = 'com.bossanovasolutions.whiskeysocial';

export const SUPPORT_EMAIL = 'support@whiskeysocial.app';

export const DEEPLINK = 'https://whiskeysocial.page.link/email-verify';

export const GOOGLE_PROJECT_ID =
  Platform.OS === 'ios'
    ? '693925217860-kb98cqvl676uc3sipuiqggol75uk69vl.apps.googleusercontent.com'
    : '693925217860-eemk0n63p2fumgd67almul7pg3jct004.apps.googleusercontent.com';

export const NEARBY_PLACES_RADIUS_KM = 100;
