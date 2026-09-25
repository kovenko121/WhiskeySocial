import devConfig from '../../aws-exports';
import prodConfig from '../../aws-exports.prod';

const isDevOrPreview = process.env.EXPO_PUBLIC_APP_ENV === 'development' || process.env.EXPO_PUBLIC_APP_ENV === 'preview';
const awsConfig = isDevOrPreview ? devConfig : prodConfig;

export default awsConfig;
