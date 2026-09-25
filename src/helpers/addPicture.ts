import { takePicture } from './takePicture';
import { uploadPicture } from './uploadPicture';

export const addPicture = async (
  imageSource: 'upload' | 'take',
  menuStatus: (status: boolean) => void,
  setPicture: (picture: any) => void
) => {
  menuStatus(false);
  const picture =
    imageSource === 'upload' ? await uploadPicture() : await takePicture();
  if (picture) {
    setPicture(picture);
  }
};
