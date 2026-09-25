import { manipulateAsync } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';
import { Alert } from '../components/Alert/Alert';

// Default width and height for the image set the image aspect ratio which is 1:1
// We're defaulting to 1:1 because iOS doesn't allow us to set the aspect ratio through Expo's ImagePicker
// So we're making the default aspect ratio 1:1 to ensure consistency across platforms.

const uploadPicture = async (width = 1, height = 1, allowsEditing = true) => {
  const permissionRequest =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionRequest.granted) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect: [width, height],
      quality: 0.5,
    });

    if (!result.canceled) {
      const manipulateResult = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1000 } }],
        {
          compress: 0.5,
        }
      );
      return manipulateResult;
    }
  } else {
    return Alert(
      'Permission denied',
      'We need image library access to make this work! Would you like to give us permission?',
      () => {},
      () => {
        Linking.openSettings();
      }
    );
  }

  return null;
};
export { uploadPicture };
