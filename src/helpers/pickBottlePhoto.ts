import { Alert } from 'react-native';
import { takePicture } from './takePicture';
import { uploadPicture } from './uploadPicture';

type Picture = { uri: string } | null;

const choose = (): Promise<'take' | 'upload' | null> =>
  new Promise((resolve) => {
    Alert.alert('Scan bottle', 'Use a photo of the bottle label.', [
      { text: 'Take Photo', onPress: () => resolve('take') },
      { text: 'Upload Picture', onPress: () => resolve('upload') },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });

const pickBottlePhoto = async (): Promise<Picture> => {
  const source = await choose();

  if (!source) return null;

  try {
    const picture =
      source === 'take'
        ? await takePicture(3, 4, false)
        : await uploadPicture(3, 4, false);

    return picture?.uri ? { uri: picture.uri } : null;
  } catch (error) {
    Alert.alert(
      'Camera unavailable',
      'That photo could not be captured. Try uploading one from your library instead.'
    );
    return null;
  }
};

export { pickBottlePhoto };
