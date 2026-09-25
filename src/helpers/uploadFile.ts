import * as DocumentPicker from 'expo-document-picker';

const uploadFile = async () => {
  try {
    const file = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (file?.assets === null) {
      throw new Error('User cancelled');
    }

    return file.assets[0];
  } catch (error) {
    return null;
  }
};
export { uploadFile };
