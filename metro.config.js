const exclusionList = require('metro-config/src/defaults/exclusionList');
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

module.exports = (() => {
  // Obtain the default config
  const config = getSentryExpoConfig(__dirname);

  // Extend the default source extensions - prevents this error
  // Unable to resolve "nanoid/non-secure" from "node_modules/@react-navigation/core/lib/commonjs/PreventRemoveProvider.js"
  config.resolver.sourceExts.push('svg', 'cjs');

  // Disable package.json exports to fix dual package hazard in RN 0.79/Expo SDK 53
  // See: https://expo.dev/changelog/sdk-53
  config.resolver.unstable_enablePackageExports = false;

  // Modify the blacklist resolver regex if necessary
  config.resolver.blacklistRE = exclusionList([/amplify\/#current-cloud-backend\/.*/]);

  // Add early logger to diagnose Hermes "property is not configurable" error (non-production environments)
  if (process.env.NODE_ENV !== 'production') {
    const rnGetPolyfills = config.serializer.getPolyfills;
    config.serializer.getPolyfills = (ctx) => [
      require.resolve('./early-logger.js'),
      ...(rnGetPolyfills ? rnGetPolyfills(ctx) : []),
    ];
  }

  return {
    ...config,
    resetCache: true,
  };
})();