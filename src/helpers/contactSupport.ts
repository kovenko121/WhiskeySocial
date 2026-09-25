import { Alert, Linking } from 'react-native';
import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';
import { capturePostHogEvent } from '../config/posthog';
import { createLogger } from '../services/logger';
import { isAndroid, isIos, SUPPORT_EMAIL } from './consts';

const logger = createLogger('contactSupport');

export type SupportContactSource =
  | 'settings'
  | 'email_verification'
  | 'error_boundary';

const getPlatformLabel = (): string => {
  if (isIos) return 'iOS';
  if (isAndroid) return 'Android';
  return 'Unknown';
};

const buildSupportMailto = (): string => {
  const platform = getPlatformLabel();
  const appVersion = Application.nativeApplicationVersion ?? 'Unknown';

  const subject = 'Whiskey Social Support';
  const body = [
    'Describe your issue:',
    '',
    '',
    '---',
    `App version: ${appVersion}`,
    `Platform: ${platform}`,
  ].join('\n');

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
};

/**
 * Opens the device mail composer pre-addressed to support, with the subject and
 * a body pre-filled with the app version + platform. Safe to call from anywhere,
 * including class components outside the provider/theme tree (e.g. ErrorBoundary)
 * — it uses no hooks, context, or theme. Never throws: when no mail client is
 * available it copies the address to the clipboard and shows a non-crashing alert.
 */
export const contactSupport = async (
  source: SupportContactSource,
): Promise<void> => {
  // Analytics must never block the support action.
  try {
    capturePostHogEvent('support_contact_tapped', { source });
  } catch (error) {
    logger.error('Failed to capture support_contact_tapped', error as Error);
  }

  const url = buildSupportMailto();

  // Attempt to open the composer directly. We deliberately do NOT gate this on
  // Linking.canOpenURL: on Android 11+ canOpenURL('mailto:') returns false unless
  // the `mailto` scheme is declared in the manifest <queries>, which it is not —
  // that would wrongly send users with a mail app to the fallback. openURL uses
  // startActivity, which is not subject to package-visibility filtering and
  // rejects only when no handler genuinely exists.
  try {
    await Linking.openURL(url);
    return;
  } catch (error) {
    logger.error('Failed to open mail composer', error as Error);
  }

  // No mail client available — fail safe: copy the address and tell the user.
  try {
    await Clipboard.setStringAsync(SUPPORT_EMAIL);
  } catch (error) {
    logger.error('Failed to copy support email to clipboard', error as Error);
  }

  Alert.alert(
    'No mail app found',
    `Email us at ${SUPPORT_EMAIL} — we've copied the address to your clipboard.`,
  );
};
