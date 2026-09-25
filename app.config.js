const { version } = require('./src/version.json');

export default {
  expo: {
    name: "Whiskey Social",
    slug: "whiskey-social",
    version,
    orientation: "default",
    icon: "./assets/images/icon.png",
    scheme: "whiskeysocial",
    userInterfaceStyle: "automatic",
    jsEngine: "hermes",
    splash: {
      image: "./assets/images/splashscreen.png",
      resizeMode: "cover",
      backgroundColor: "#192333",
    },
    updates: {
      url: "https://u.expo.dev/f650e2ec-39be-4f81-af3d-876bd03e325c",
    },
    runtimeVersion: "1.2.4",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "app.whiskeysocial",
      jsEngine: "hermes",
      associatedDomains: ["applinks:whiskeysocial.app"],
      googleServicesFile: "./GoogleService-Info.plist",
      config: {
        googleMapsApiKey: "AIzaSyCQAIkvlO8TB15XSHCugalqlTfwS-vKZ44",
      },
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
          },
        ],
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      googleServicesFile: "./google-services.json",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: {
            scheme: "whiskeysocial",
          },
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "whiskeysocial.app",
              pathPrefix: "/whiskey",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "whiskeysocial.app",
              pathPrefix: "/article",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "whiskeysocial.app",
              pathPattern: "/user/.*",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "whiskeysocial.app",
              pathPattern: "/club/.*",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "whiskeysocial.app",
              pathPattern: "/passport/.*",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      config: {
        googleMaps: {
          apiKey: "AIzaSyBCvKQfs1DhZ9It04ukEJFZzwpWCXobG5g",
        },
      },
      softwareKeyboardLayoutMode: "pan",
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff",
      },
      package: "app.whiskeysocial",
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
      ],
    },
    owner: "whiskey-social",
    extra: {
      eas: {
        projectId: "f650e2ec-39be-4f81-af3d-876bd03e325c",
      },
    },
    plugins: [
      "@react-native-firebase/app",
      "./plugins/withFmtFix",
      ["react-native-maps", { "iosGoogleMapsApiKey": "AIzaSyCQAIkvlO8TB15XSHCugalqlTfwS-vKZ44" }],
      "./plugins/withGmsInitFix",
      "./plugins/withAgpVersion",
      "expo-dev-client",
      "expo-notifications",
      [
        "customerio-expo-plugin",
        {
          config: {
            cdpApiKey: process.env.EXPO_PUBLIC_CUSTOMERIO_CDP_API_KEY ?? '',
            siteId: process.env.EXPO_PUBLIC_CUSTOMERIO_SITE_ID ?? '',
            region: "us"
          },
          android: {
            googleServicesFile: "./google-services.json",
            setHighPriorityPushHandler: true,
            // The plugin defaults SDK 53 projects to pinning androidx back to
            // pre-Android-16 versions, which is incompatible with compileSdk 36.
            disableAndroid16Support: false
          },
          ios: {
            pushNotification: {
              // useRichPush: true,
              env: {
                cdpApiKey: process.env.EXPO_PUBLIC_CUSTOMERIO_CDP_API_KEY ?? '',
                region: "us",
              },
            },
          },
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            buildToolsVersion: "36.0.0",
          },
        },
      ],
      [
        "react-native-edge-to-edge",
        {
          android: {
            parentTheme: "Default",
            enforceNavigationBarContrast: false,
          },
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "Whiskey Social needs to access your photos to let you include them in posts and profiles",
          cameraPermission:
            "Whiskey Social needs access your camera to allow you to take photos for posts and profiles",
          microphonePermission:
            "Whiskey Social needs accesses your microphone to allow you to record audio descriptions",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "We need your location to provide venue recommendations based on your location",
          locationAlwaysPermission:
            "Location access is required for accurate tracking",
          locationWhenInUsePermission:
            "Location is needed while using the app to provide nearby venue locations",
        },
      ],
      [
        "expo-document-picker",
        {
          iCloudContainerEnvironment: "Production",
        },
      ],
      "expo-font",
      "expo-asset",
      "expo-web-browser",
      [
        "@sentry/react-native/expo",
        {
          project: "whiskey-social-app",
          organization: "ata-advisory-llc",
        },
      ],
      "expo-localization",
    ],
  },
};
