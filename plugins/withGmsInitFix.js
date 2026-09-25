const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// GoogleMaps SDK requires provideAPIKey() to be called before any GMSMapView
// initializes. Expo prebuild places the @generated GMS init block after
// startReactNative(), which is too late on fast hardware (iPhone 17 / A19).
// This plugin moves it to before the startReactNative block.

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const withGmsInitFix = (config) =>
  withDangerousMod(config, [
    'ios',
    (modConfig) => {
      const appDelegatePath = path.join(
        modConfig.modRequest.platformProjectRoot,
        'WhiskeySocial',
        'AppDelegate.swift'
      );
      let source = fs.readFileSync(appDelegatePath, 'utf8');

      // Already in the correct order — nothing to do
      if (source.indexOf('GMSServices.provideAPIKey') < source.indexOf('startReactNative')) {
        return modConfig;
      }

      const gmsBlockMatch = source.match(
        /\n(\/\/ @generated begin react-native-maps-init[\s\S]*?\/\/ @generated end react-native-maps-init)/
      );
      if (!gmsBlockMatch) return modConfig;

      const gmsBlock = gmsBlockMatch[1];

      // Remove from current position (after startReactNative)
      source = source.replace(`\n${  gmsBlock}`, '');

      // Insert before the #if os(iOS) block that contains startReactNative
      source = source.replace(
        '#if os(iOS) || os(tvOS)',
        `${gmsBlock  }\n#if os(iOS) || os(tvOS)`
      );

      fs.writeFileSync(appDelegatePath, source);
      return modConfig;
    },
  ]);

module.exports = withGmsInitFix;
