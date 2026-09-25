import { GraphQLClient, RequestMiddleware } from 'graphql-request';
import { Auth } from 'aws-amplify';
import awsconfig from '../config/aws';
import { createLogger } from './logger';

const logger = createLogger('amplify');

const getAccessToken = async () => {
  try {
    const session = await Auth.currentSession();
    return session.getAccessToken().getJwtToken();
  } catch (error) {
    // If no current user, throw error to properly handle auth failures
    // This prevents silent failures that could cause auth loops
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    logger.info('Failed to get access token:', {extra: normalizedError});
    throw error;
  }
};

const requestMiddleware: RequestMiddleware = async (request) => ({
  ...request,
  headers: {
    ...request.headers,
    'authorization': await getAccessToken(),
  },
});

const amplify = new GraphQLClient(awsconfig.aws_appsync_graphqlEndpoint, {
  requestMiddleware,
});

const amplifyApiKey = new GraphQLClient(awsconfig.aws_appsync_graphqlEndpoint, {
  headers: {
    'x-api-key': `${awsconfig.aws_appsync_apiKey}`,
  },
});

export { amplify, amplifyApiKey };
