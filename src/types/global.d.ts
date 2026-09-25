declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.mp4' {
  const value: AVPlaybackSource;
  export default value;
}

declare module '*.ttf' {
  const value: import('react-native').FontSource;
  export default value;
}

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_APP_ENV: 'development' | 'preview' | 'staging' | 'production';
    EXPO_PUBLIC_POSTHOG_API_KEY: string;
    EXPO_PUBLIC_SENTRY_DSN: string;
  }
}