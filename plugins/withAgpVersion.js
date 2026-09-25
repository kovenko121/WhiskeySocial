const { withProjectBuildGradle } = require('@expo/config-plugins');

// The androidx.core artifacts that come with compileSdk 36 refuse to build on
// anything below AGP 8.9.1, and Expo SDK 53 gets AGP 8.8.2 from React Native's
// gradle plugin, which contributes it to the buildscript classpath versionless.
// Declaring an explicit version here wins by Gradle's highest-version conflict
// resolution and drags gradle-api up with it.
const AGP_VERSION = '8.9.3';

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const withAgpVersion = (config) =>
  withProjectBuildGradle(config, (modConfig) => {
    const { modResults } = modConfig;

    if (modResults.contents.includes(`com.android.tools.build:gradle:${AGP_VERSION}`)) {
      return modConfig;
    }

    modResults.contents = modResults.contents.replace(
      /classpath\(['"]com\.android\.tools\.build:gradle['"]\)/,
      `classpath('com.android.tools.build:gradle:${AGP_VERSION}')`
    );

    return modConfig;
  });

module.exports = withAgpVersion;
