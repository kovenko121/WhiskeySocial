import type { ImageSourcePropType } from 'react-native';

const defaultClubImage = require('../../assets/images/Gemini-club-profile.png');

const envUrl = process.env.DEFAULT_CLUB_IMAGE_URL?.trim();
const defaultClubImageSource: ImageSourcePropType = envUrl
  ? { uri: envUrl }
  : defaultClubImage;

export const getDefaultClubImage = (): ImageSourcePropType => defaultClubImageSource;
