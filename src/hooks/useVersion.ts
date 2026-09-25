import versionData from '../version.json';

const ENV_SUFFIX = {
  'development': '-dev',
  'preview': '-preview',
  'staging': '-staging',
  'production': '',
}
export const useVersion = () => ({
    version: `${versionData.version}${ENV_SUFFIX[process.env.EXPO_PUBLIC_APP_ENV] || ''}`,
  });
