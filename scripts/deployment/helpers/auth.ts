/**
 * Shared authentication helper for deployment scripts
 */

import { Auth , Amplify } from 'aws-amplify';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

/**
 * Prompt for user input
 */
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

interface AwsConfig {
  graphqlEndpoint: string;
  apiKey: string;
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  identityPoolId: string;
}

let isInitialized = false;

/**
 * Extract error message from unknown error type
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Load AWS configuration from aws-exports.js or environment variables
 */
export function loadAwsConfig(): AwsConfig {
  try {
    const awsExportsPath = path.join(__dirname, '..', '..', '..', 'aws-exports.js');

    if (fs.existsSync(awsExportsPath)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const awsExports = require(awsExportsPath);
      return {
        graphqlEndpoint:
          awsExports.default?.aws_appsync_graphqlEndpoint ||
          awsExports.aws_appsync_graphqlEndpoint,
        apiKey:
          awsExports.default?.aws_appsync_apiKey || awsExports.aws_appsync_apiKey,
        region:
          awsExports.default?.aws_project_region || awsExports.aws_project_region,
        userPoolId:
          awsExports.default?.aws_user_pools_id || awsExports.aws_user_pools_id,
        userPoolWebClientId:
          awsExports.default?.aws_user_pools_web_client_id ||
          awsExports.aws_user_pools_web_client_id,
        identityPoolId:
          awsExports.default?.aws_cognito_identity_pool_id ||
          awsExports.aws_cognito_identity_pool_id,
      };
    }

    // Fallback to environment variables
    return {
      graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || '',
      apiKey: process.env.API_KEY || '',
      region: process.env.AWS_REGION || 'us-east-2',
      userPoolId: process.env.USER_POOL_ID || '',
      userPoolWebClientId: process.env.USER_POOL_WEB_CLIENT_ID || '',
      identityPoolId: process.env.IDENTITY_POOL_ID || '',
    };
  } catch (error) {
    throw new Error(`Failed to load AWS configuration: ${getErrorMessage(error)}`, { cause: error });
  }
}

/**
 * Validate that required AWS config fields are present
 */
function validateAwsConfig(config: AwsConfig): void {
  const requiredFields: (keyof AwsConfig)[] = [
    'region',
    'userPoolId',
    'userPoolWebClientId',
  ];

  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required AWS configuration: ${missingFields.join(', ')}. ` +
        'Ensure aws-exports.js exists or set environment variables.'
    );
  }
}

/**
 * Initialize Amplify with the AWS configuration
 */
export function initializeAmplify(config?: AwsConfig): void {
  if (isInitialized) {
    return;
  }

  const awsConfig = config || loadAwsConfig();

  // Validate required fields before configuring
  validateAwsConfig(awsConfig);

  Amplify.configure({
    Auth: {
      region: awsConfig.region,
      userPoolId: awsConfig.userPoolId,
      userPoolWebClientId: awsConfig.userPoolWebClientId,
      identityPoolId: awsConfig.identityPoolId,
    },
  });

  isInitialized = true;
}

/** Cognito user type returned from Auth.signIn */
interface CognitoUser {
  username: string;
  attributes?: Record<string, string>;
  signInUserSession?: {
    accessToken: { jwtToken: string };
    idToken: { jwtToken: string };
    refreshToken: { token: string };
  };
}

/**
 * Authenticate with Cognito using username and password
 * Will prompt for credentials if not provided via args or environment variables
 */
export async function authenticate(
  username?: string,
  password?: string
): Promise<{ token: string; user: CognitoUser }> {
  let user = username || process.env.COGNITO_USERNAME;
  let pass = password || process.env.COGNITO_PASSWORD;

  // Prompt for credentials if not provided
  if (!user) {
    user = await prompt('Cognito username (email): ');
  }
  if (!pass) {
    pass = await prompt('Cognito password: ');
  }

  if (!user || !pass) {
    throw new Error('Authentication credentials are required.');
  }

  // Ensure Amplify is initialized
  initializeAmplify();

  try {
    const cognitoUser = await Auth.signIn(user, pass);
    const session = await Auth.currentSession();
    const token = session.getAccessToken().getJwtToken();

    return { token, user: cognitoUser };
  } catch (error) {
    throw new Error(`Authentication failed: ${getErrorMessage(error)}`, { cause: error });
  }
}

/**
 * Get current auth token (must be authenticated first)
 */
export async function getAuthToken(): Promise<string> {
  try {
    const session = await Auth.currentSession();
    return session.getAccessToken().getJwtToken();
  } catch (error) {
    throw new Error(`Failed to get auth token: ${getErrorMessage(error)}`, { cause: error });
  }
}

/**
 * Get auth headers for GraphQL requests
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    await Auth.signOut();
    isInitialized = false;
  } catch (error) {
    // Ignore sign out errors
  }
}
