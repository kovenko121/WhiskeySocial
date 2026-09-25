import { CustomerIO, CioRegion, CioLogLevel, CioLocationTrackingMode, PushClickBehaviorAndroid } from 'customerio-reactnative';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAmplifyEnvironment } from './environment';
import { CioEventData, CioEventName, CioIdentityAttributes } from '../types/customerio';

const CDP_API_KEY = process.env.EXPO_PUBLIC_CUSTOMERIO_CDP_API_KEY ?? '';

// Device-cached lifecycle counters, namespaced per userId.
const checkInsKey = (userId: string) => `cioTotalCheckIns:${userId}`;
const firstCheckInKey = (userId: string) => `cioFirstCheckInDate:${userId}`;

const parsePositiveInt = (raw: string | null): number | undefined => {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : undefined;
};


export const initCustomerIO = () => {
  if (!CDP_API_KEY) return;

  CustomerIO.initialize({
    cdpApiKey: CDP_API_KEY,
    // inApp omitted: enabling the Gist SDK before identify causes GistNetworkError 0.
    region: CioRegion.US,
    logLevel: __DEV__ ? CioLogLevel.Debug : CioLogLevel.Error,
    autoTrackDeviceAttributes: false,
    // Disabled to avoid duplicate lifecycle events alongside PostHog autocapture.
    trackApplicationLifecycleEvents: false,
    push: {
      android: { pushClickBehavior: PushClickBehaviorAndroid.ResetTaskStack }
    },
    location: {
      trackingMode: CioLocationTrackingMode.Off
    },
  });
};

export const cioIdentify = (userId: string, attributes: CioIdentityAttributes) => {
  if (!CDP_API_KEY) return;
  CustomerIO.identify({
    userId,
    traits: {
      ...attributes,
      id: userId,
      environment: getAmplifyEnvironment(),
    },
  });
};

export const cioRegisterPushToken = (token: string) => {
  if (!CDP_API_KEY) return;
  CustomerIO.registerDeviceToken(token);
};

export const cioTrack = (
  eventName: CioEventName,
  data?: CioEventData
) => {
  if (!CDP_API_KEY) return;
  CustomerIO.track(eventName, data ?? {});
};

export const cioReset = () => {
  if (!CDP_API_KEY) return;
  CustomerIO.clearIdentify();
};

// Read the device-cached lifecycle counters for the identify payload.
export const getCioLifecycleAttributes = async (
  userId: string
): Promise<Pick<CioIdentityAttributes, 'total_check_ins' | 'first_check_in_date'>> => {
  const attributes: Pick<CioIdentityAttributes, 'total_check_ins' | 'first_check_in_date'> = {};
  if (!userId) return attributes;
  try {
    const [countRaw, firstRaw] = await Promise.all([
      AsyncStorage.getItem(checkInsKey(userId)),
      AsyncStorage.getItem(firstCheckInKey(userId)),
    ]);
    attributes.total_check_ins = parsePositiveInt(countRaw);
    attributes.first_check_in_date = parsePositiveInt(firstRaw);
  } catch {
    // AsyncStorage unavailable — omit lifecycle attrs.
  }
  return attributes;
};

// Advance the cached check-in counter and push updated lifecycle attributes to CIO.
export const cioRecordCheckIn = async (userId: string) => {
  if (!CDP_API_KEY || !userId) return;
  const now = Math.floor(Date.now() / 1000);
  try {
    const [countRaw, firstRaw] = await Promise.all([
      AsyncStorage.getItem(checkInsKey(userId)),
      AsyncStorage.getItem(firstCheckInKey(userId)),
    ]);

    const totalCheckIns = (parsePositiveInt(countRaw) ?? 0) + 1;
    await AsyncStorage.setItem(checkInsKey(userId), String(totalCheckIns));

    const attributes: CioIdentityAttributes = { total_check_ins: totalCheckIns, last_active: now };

    if (parsePositiveInt(firstRaw) === undefined) {
      await AsyncStorage.setItem(firstCheckInKey(userId), String(now));
      attributes.first_check_in_date = now;
    }

    cioIdentify(userId, attributes);
  } catch {
    // Best-effort — must never break check-in creation.
  }
};
