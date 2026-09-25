import { manipulateAsync } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';
import { Alert } from '../components/Alert/Alert';

const takePicture = async (width = 4, height = 3, allowsEditing = true) => {
  const permissionRequest = await ImagePicker.requestCameraPermissionsAsync();

  if (permissionRequest.granted) {
    const result = await ImagePicker.launchCameraAsync({
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
export { takePicture };
