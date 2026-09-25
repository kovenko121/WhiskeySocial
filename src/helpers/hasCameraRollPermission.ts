import { PermissionsAndroid, Platform } from 'react-native';
import { isIos } from './consts';

async function androidPermission() {
  const permission =
    Platform.Version >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

  const hasPermission = await PermissionsAndroid.check(permission);

  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission);

  return status === 'granted';
}

async function iosPermission() {
  return true;
}

async function hasCameraRollPermission() {
  const permission = isIos ? await iosPermission() : await androidPermission();

  return permission;
}

export { hasCameraRollPermission };
