#!/usr/bin/env ts-node

import { GraphQLClient } from 'graphql-request';
import * as fs from 'fs';
import * as path from 'path';
import { Auth , Amplify } from 'aws-amplify';

// GraphQL queries and mutations
const GET_ALL_POSTS = `
  query ListPosts($limit: Int, $nextToken: String) {
    listPosts(limit: $limit, nextToken: $nextToken) {
      items {
        id
        likesCount
        likes {
          items {
            id
            userId
          }
        }
      }
      nextToken
    }
  }
`;

const SYNC_POST_LIKES_COUNT = `
  mutation UpdatePostLikes($input: UpdatePostLikesInput!) {
    updatePostLikes(input: $input) {
      success
      message
      postId
      likesCount
    }
  }
`;

interface Post {
  id: string;
  likesCount: number;
  likes: {
    items: Array<{
      id: string;
      userId: string;
    }>;
  };
}

interface ListPostsResponse {
  listPosts: {
    items: Post[];
    nextToken?: string;
  };
}

interface UpdatePostLikesResult {
  success: boolean;
  message: string;
  postId: string;
  likesCount: number;
}

class LikesCountSyncService {
  private client: GraphQLClient;

  private stats = {
    totalPosts: 0,
    postsUpdated: 0,
    postsSkipped: 0,
    errors: 0,
  };

  private useAuth: boolean;

  constructor(graphqlEndpoint: string, apiKey?: string, useAuth = false) {
    this.useAuth = useAuth;
    
    if (useAuth) {
      // For authenticated requests, we'll set headers dynamically per request
      this.client = new GraphQLClient(graphqlEndpoint);
    } else {
      // For API key based requests
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      this.client = new GraphQLClient(graphqlEndpoint, {
        headers,
      });
    }
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.useAuth) {
      return {};
    }

    try {
      const session = await Auth.currentSession();
      const token = session.getAccessToken().getJwtToken();
      return {
        'Authorization': token,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
      throw new Error('Authentication failed');
    }
  }

  async syncAllPosts(): Promise<void> {
    console.log('🚀 Starting likes count sync process using atomic operations...\n');
    
    let nextToken: string | undefined;
    let pageCount = 0;

    try {
      do {
        pageCount++;
        console.log(`📄 Processing page ${pageCount}...`);

        const response = await this.client.request<ListPostsResponse>(
          GET_ALL_POSTS,
          {
            limit: 50,
            nextToken,
          },
          this.useAuth ? await this.getAuthHeaders() : undefined
        );

        const posts = response.listPosts.items;
        nextToken = response.listPosts.nextToken;

        await this.processPosts(posts);

        console.log(`✅ Processed page ${pageCount} with ${posts.length} posts\n`);

      } while (nextToken);

      this.printFinalStats();

    } catch (error) {
      console.error('❌ Fatal error during sync:', error);
      throw error;
    }
  }

  private async processPosts(posts: Post[]): Promise<void> {
    for (const post of posts) {
      try {
        this.stats.totalPosts++;

        // Count actual likes
        const actualLikesCount = post.likes?.items?.length || 0;
        const currentLikesCount = post.likesCount || 0;

        if (actualLikesCount !== currentLikesCount) {
          console.log(
            `🔄 Post ${post.id}: Syncing likes count from ${currentLikesCount} to ${actualLikesCount}`
          );

          await this.syncPostLikesCount(post.id);
          this.stats.postsUpdated++;
        } else {
          this.stats.postsSkipped++;
          console.log(
            `✓ Post ${post.id}: Already correct (${currentLikesCount} likes)`
          );
        }

        // Small delay to avoid overwhelming the API
        await this.delay(200);

      } catch (error) {
        this.stats.errors++;
        console.error(`❌ Error processing post ${post.id}:`, error);
        // Continue processing other posts even if one fails
      }
    }
  }

  // The server recomputes the count for the 'sync' action, so no target is passed.
  private async syncPostLikesCount(postId: string): Promise<void> {
    const dummyUserId = 'system-sync-user';
    
    try {
      const result = await this.client.request<{ updatePostLikes: UpdatePostLikesResult }>(
        SYNC_POST_LIKES_COUNT,
        {
          input: {
            userId: dummyUserId,
            postId,
            action: 'sync'
          }
        },
        this.useAuth ? await this.getAuthHeaders() : undefined
      );

      if (result.updatePostLikes.success) {
        console.log(`   ✅ Successfully synced to ${result.updatePostLikes.likesCount} likes`);
      } else {
        console.log(`   ⚠️  Sync reported: ${result.updatePostLikes.message}`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to sync post ${postId}:`, error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private printFinalStats(): void {
    console.log(`\n${  '='.repeat(50)}`);
    console.log('📊 SYNC COMPLETED - FINAL STATISTICS');
    console.log('='.repeat(50));
    console.log(`Total posts processed: ${this.stats.totalPosts}`);
    console.log(`Posts updated: ${this.stats.postsUpdated}`);
    console.log(`Posts already correct: ${this.stats.postsSkipped}`);
    console.log(`Errors encountered: ${this.stats.errors}`);
    console.log('='.repeat(50));

    if (this.stats.errors > 0) {
      console.log('⚠️  Some errors occurred during the sync process.');
      console.log('   Check the logs above for details.');
    } else {
      console.log('🎉 All posts processed successfully!');
    }
  }
}

// Configuration
function loadConfig() {
  try {
    // Try to load AWS exports for GraphQL endpoint
    const awsExportsPath = path.join(__dirname, '../aws-exports.js');
    
    if (fs.existsSync(awsExportsPath)) {
      // If aws-exports.js exists, we can extract the endpoint from it
      const awsExports = require(awsExportsPath);
      return {
        graphqlEndpoint: awsExports.default?.aws_appsync_graphqlEndpoint || awsExports.aws_appsync_graphqlEndpoint,
        apiKey: awsExports.default?.aws_appsync_apiKey || awsExports.aws_appsync_apiKey,
        region: awsExports.default?.aws_project_region || awsExports.aws_project_region,
        userPoolId: awsExports.default?.aws_user_pools_id || awsExports.aws_user_pools_id,
        userPoolWebClientId: awsExports.default?.aws_user_pools_web_client_id || awsExports.aws_user_pools_web_client_id,
        identityPoolId: awsExports.default?.aws_cognito_identity_pool_id || awsExports.aws_cognito_identity_pool_id,
      };
    }

    // Fallback to environment variables
    return {
      graphqlEndpoint: process.env.GRAPHQL_ENDPOINT,
      apiKey: process.env.API_KEY,
      region: process.env.AWS_REGION,
      userPoolId: process.env.USER_POOL_ID,
      userPoolWebClientId: process.env.USER_POOL_WEB_CLIENT_ID,
      identityPoolId: process.env.IDENTITY_POOL_ID,
    };
  } catch (error) {
    console.error('❌ Error loading configuration:', error);
    throw new Error('Could not load GraphQL configuration');
  }
}

// Initialize AWS Amplify
function initializeAmplify(config: any) {
  Amplify.configure({
    Auth: {
      region: config.region,
      userPoolId: config.userPoolId,
      userPoolWebClientId: config.userPoolWebClientId,
      identityPoolId: config.identityPoolId,
    },
  });
}

// Authenticate user
async function authenticateUser(username: string, password: string) {
  try {
    const user = await Auth.signIn(username, password);
    console.log('✅ Authentication successful');
    return user;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    const config = loadConfig();

    if (!config.graphqlEndpoint) {
      throw new Error(
        'GraphQL endpoint not found. Please ensure aws-exports.js exists or set GRAPHQL_ENDPOINT environment variable.'
      );
    }

    console.log('🔧 Configuration loaded:');
    console.log(`   GraphQL Endpoint: ${config.graphqlEndpoint}`);
    console.log('   Authentication Mode: Cognito User Pool (required for updatePostLikes)');
    
    // Get credentials from environment or command line
    const username = process.env.COGNITO_USERNAME || process.argv[process.argv.indexOf('--username') + 1];
    const password = process.env.COGNITO_PASSWORD || process.argv[process.argv.indexOf('--password') + 1];
    
    if (!username || !password) {
      throw new Error(
        'Username and password required for sync operation. ' +
        'Set COGNITO_USERNAME and COGNITO_PASSWORD environment variables or use --username and --password flags.'
      );
    }
    
    // Initialize Amplify
    initializeAmplify(config);
    
    // Authenticate
    console.log('🔐 Authenticating user...');
    await authenticateUser(username, password);
    
    const syncService = new LikesCountSyncService(config.graphqlEndpoint, undefined, true);
    
    console.log('\n');
    await syncService.syncAllPosts();

  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Process interrupted by user. Exiting...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Process terminated. Exiting...');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

export { LikesCountSyncService };