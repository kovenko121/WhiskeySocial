module.exports = (api) => {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          alias: {
            '@components': './src/components/index.ts',
            '@services': './src/services/index.ts',
            '@types': './src/types/index.ts',
            '@assets': './src/types/index.ts',
            '@theme': './src/styles/theme.ts',
            '@helpers': './src/helpers/index.ts',
            '@contexts': './src/contexts/index.ts',
            '@hooks': './src/hooks/index.ts',
          },
        },
      ],
      'react-native-reanimated/plugin',
      [
        'module:react-native-dotenv',
        {
          envName: 'APP_ENV',
          moduleName: 'react-native-dotenv',
          path: '.env',
        },
      ],
    ],
  };
};
