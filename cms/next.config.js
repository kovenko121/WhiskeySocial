const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  transpilePackages: [
    '@refinedev/nextjs-router',
    '@refinedev/antd',
    '@refinedev/inferencer',
  ],
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    API_URL: process.env.API_URL,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_REGION: process.env.S3_REGION,
  },
};
