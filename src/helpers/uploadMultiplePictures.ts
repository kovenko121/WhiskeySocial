import { manipulateAsync, type ImageResult } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';
import { Alert } from '../components/Alert/Alert';

// allowsEditing is incompatible with allowsMultipleSelection in expo-image-picker,
// so this helper skips editing but still resizes and compresses each asset.
const uploadMultiplePictures = async (
  limit: number
): Promise<ImageResult[] | null> => {
  const permissionRequest =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionRequest.granted) {
    Alert(
      'Permission denied',
      'We need image library access to make this work! Would you like to give us permission?',
      () => {},
      () => {
        Linking.openSettings();
      }
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 0.5,
  });

  if (result.canceled) return null;

  return Promise.all(
    result.assets.map((asset) =>
      manipulateAsync(asset.uri, [{ resize: { width: 1000 } }], { compress: 0.5 })
    )
  );
};

export { uploadMultiplePictures };
