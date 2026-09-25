#!/usr/bin/env ts-node

import { GraphQLClient } from 'graphql-request';
import * as fs from 'fs';
import * as path from 'path';
import { Auth , Amplify } from 'aws-amplify';

// GraphQL queries and mutations
const LIST_WHISKEYS_MISSING_BRAND_ID = `
  query ListWhiskeys($limit: Int, $nextToken: String) {
    listWhiskeys(filter: { brandId: { attributeExists: false } }, limit: $limit, nextToken: $nextToken) {
      items {
        id
        brand
        brandId
      }
      nextToken
    }
  }
`;

const LIST_BRAND_USERS = `
  query ListBrandUsers($filter: ModelUserFilterInput, $limit: Int, $nextToken: String) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        brandName
        userType
      }
      nextToken
    }
  }
`;

const CREATE_USER = `
  mutation CreateUser(
    $id: ID!
    $username: String!
    $userType: UserType!
    $brandName: String
  ) {
    createUser(
      id: $id
      username: $username
      userType: $userType
      brandName: $brandName
    )
  }
`;

const UPDATE_WHISKEY = `
  mutation UpdateWhiskey($input: UpdateWhiskeyInput!) {
    updateWhiskey(input: $input) {
      id
      brandId
    }
  }
`;

interface Whiskey {
  id: string;
  brand?: string;
  brandId?: string;
}

interface BrandUser {
  id: string;
  brandName?: string;
  userType: string;
}

interface ListWhiskeysResponse {
  listWhiskeys: {
    items: Whiskey[];
    nextToken?: string;
  };
}

interface ListBrandUsersResponse {
  listUsers: {
    items: BrandUser[];
    nextToken?: string;
  };
}

interface CreateUserResponse {
  createUser: string;
}

interface UpdateWhiskeyResponse {
  updateWhiskey: Whiskey;
}

class WhiskeyBrandLinker {
  private client: GraphQLClient;

  private executeChanges: boolean;

  private brandNameToId = new Map<string, string>(); // brandName.toLowerCase() -> userId

  private stats = {
    totalWhiskeys: 0,
    whiskeysMissingBrandId: 0,
    whiskeysWithEmptyBrand: 0,
    whiskeysLinked: 0,
    brandsCreated: 0,
    errors: 0
  };

  constructor(graphqlEndpoint: string, options: { execute?: boolean } = {}) {
    this.executeChanges = options.execute || false;
    this.client = new GraphQLClient(graphqlEndpoint);
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
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

  async run(): Promise<void> {
    const mode = this.executeChanges ? '🚀 EXECUTION MODE' : '🔍 DRY RUN MODE';
    console.log(`${mode} - Whiskey Brand Linking`);
    
    if (!this.executeChanges) {
      console.log('📋 Analysis only - NO changes will be made!');
      console.log('💡 Use --execute flag to perform actual linking\n');
    } else {
      console.log('⚠️  REAL CHANGES will be made to the database!\n');
    }
    
    try {
      // Step 1: Load all brand users
      await this.loadBrandUsers();
      
      // Step 2: Process whiskeys without brandId
      await this.processWhiskeysWithoutBrandId();
      
      // Step 3: Show results
      this.showResults();
      
    } catch (error) {
      console.error('❌ Linking failed:', error);
      process.exit(1);
    }
  }

  private async loadBrandUsers(): Promise<void> {
    console.log('📋 Loading all brand users...');
    
    let nextToken: string | undefined;
    let brandCount = 0;
    
    do {
      const response = await this.client.request<ListBrandUsersResponse>(
        LIST_BRAND_USERS,
        {
          filter: {
            userType: { eq: 'BRAND' }
          },
          nextToken,
          limit: 100
        },
        await this.getAuthHeaders()
      );
      
      const users = response.listUsers.items;
      nextToken = response.listUsers.nextToken;
      
      // forEach runs synchronously within the iteration, so brandCount cannot be
      // captured stale.
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      users.forEach((user) => {
        if (user.brandName && user.id) {
          const brandKey = user.brandName.toLowerCase().trim();
          this.brandNameToId.set(brandKey, user.id);
          brandCount++;
        }
      });
      
    } while (nextToken);
    
    console.log(`Found ${brandCount} existing brand users\n`);
  }

  private async processWhiskeysWithoutBrandId(): Promise<void> {
    console.log('🥃 Processing whiskeys without brandId...');
    
    let nextToken: string | undefined;
    let processedCount = 0;
    
    do {
      const response = await this.client.request<ListWhiskeysResponse>(
        LIST_WHISKEYS_MISSING_BRAND_ID,
        {
          nextToken,
          limit: 100
        },
        await this.getAuthHeaders()
      );
      
      const whiskeys = response.listWhiskeys.items;
      nextToken = response.listWhiskeys.nextToken;
      
      this.stats.whiskeysMissingBrandId += whiskeys.length;
      
      for (const whiskey of whiskeys) {
        await this.processWhiskey(whiskey);
        processedCount++;
        
        if (processedCount % 50 === 0) {
          console.log(`  Processed ${processedCount} whiskeys...`);
        }
      }
      
    } while (nextToken);
    
    this.stats.totalWhiskeys = processedCount;
    console.log(`\nCompleted processing ${processedCount} whiskeys without brandId`);
  }

  private async processWhiskey(whiskey: Whiskey): Promise<void> {
    try {
      // Skip whiskeys without brand name
      if (!whiskey.brand || !whiskey.brand.trim()) {
        this.stats.whiskeysWithEmptyBrand++;
        return;
      }

      const brandName = whiskey.brand.trim();
      const brandKey = brandName.toLowerCase();
      
      // Check if we already have a brand user for this brand
      let brandUserId = this.brandNameToId.get(brandKey);
      
      if (!brandUserId) {
        // Need to create a new brand user
        const newBrandUserId = await this.createBrandUser(brandName);
        if (!newBrandUserId) {
          this.stats.errors++;
          return;
        }
        brandUserId = newBrandUserId;
      }
      
      // Link the whiskey to the brand
      await this.linkWhiskeyToBrand(whiskey, brandUserId, brandName);
      
    } catch (error: any) {
      console.error(`  ❌ Error processing whiskey ${whiskey.id}:`, error.message || error);
      this.stats.errors++;
    }
  }

  private async createBrandUser(brandName: string): Promise<string | null> {
    try {
      const userId = require('crypto').randomUUID();
      const username = this.generateUsername(brandName);
      
      if (!this.executeChanges) {
        console.log(`    💡 Would create brand user: ${brandName} -> ${userId}`);
        
        // Add to our map for dry run consistency
        const brandKey = brandName.toLowerCase();
        this.brandNameToId.set(brandKey, userId);
        this.stats.brandsCreated++;
        
        return userId;
      }

      console.log(`    🔄 Creating brand user: ${brandName}`);
      
      const createResponse = await this.client.request<CreateUserResponse>(
        CREATE_USER,
        {
          id: userId,
          username,
          userType: 'BRAND',
          brandName
        },
        await this.getAuthHeaders()
      );
      
      const returnedUserId = createResponse.createUser;
      
      if (!returnedUserId || typeof returnedUserId !== 'string') {
        throw new Error('No valid user ID returned from createUser mutation');
      }
      
      console.log(`    ✅ Created brand user: ${brandName} -> ${returnedUserId}`);
      
      // Add to our map
      const brandKey = brandName.toLowerCase();
      this.brandNameToId.set(brandKey, returnedUserId);
      this.stats.brandsCreated++;
      
      // Rate limiting
      await this.delay(100);
      
      return returnedUserId;
      
    } catch (error: any) {
      console.error(`    ❌ Failed to create brand user for "${brandName}":`, error.message || error);
      return null;
    }
  }

  private async linkWhiskeyToBrand(whiskey: Whiskey, brandUserId: string, brandName: string): Promise<void> {
    if (!this.executeChanges) {
      console.log(`    💡 Would link whiskey ${whiskey.id} to brand: ${brandName} (${brandUserId})`);
      this.stats.whiskeysLinked++;
      return;
    }

    try {
      await this.client.request<UpdateWhiskeyResponse>(
        UPDATE_WHISKEY,
        {
          input: {
            id: whiskey.id,
            brandId: brandUserId
          }
        },
        await this.getAuthHeaders()
      );
      
      console.log(`    ✅ Linked whiskey ${whiskey.id} to brand: ${brandName}`);
      this.stats.whiskeysLinked++;
      
      // Rate limiting
      await this.delay(50);
      
    } catch (error: any) {
      console.error(`    ❌ Failed to link whiskey ${whiskey.id} to brand ${brandName}:`, error.message || error);
      this.stats.errors++;
    }
  }

  private generateUsername(brandName: string): string {
    const safeName = !brandName || typeof brandName !== 'string' ? 'brand' : brandName;

    let base = safeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    
    if (!base) {
      base = 'brand';
    }
    
    return `${base}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private showResults(): void {
    console.log('\n📊 LINKING RESULTS\n');
    
    console.log('📈 SUMMARY:');
    console.log(`Whiskeys missing brandId: ${this.stats.whiskeysMissingBrandId}`);
    console.log(`Whiskeys with empty brand name: ${this.stats.whiskeysWithEmptyBrand}`);
    console.log(`Whiskeys successfully linked: ${this.stats.whiskeysLinked}`);
    console.log(`New brand users created: ${this.stats.brandsCreated}`);
    console.log(`Errors encountered: ${this.stats.errors}`);
    
    const processableWhiskeys = this.stats.whiskeysMissingBrandId - this.stats.whiskeysWithEmptyBrand;
    const successRate = processableWhiskeys > 0 
      ? (this.stats.whiskeysLinked / processableWhiskeys * 100).toFixed(1)
      : '0';
    
    console.log(`\n📊 Success rate: ${successRate}% of processable whiskeys`);
    
    if (this.stats.whiskeysLinked > 0) {
      if (this.executeChanges) {
        console.log(`\n✅ Successfully linked ${this.stats.whiskeysLinked} whiskeys to brands`);
        if (this.stats.brandsCreated > 0) {
          console.log(`🏭 Created ${this.stats.brandsCreated} new brand users`);
        }
        if (this.stats.errors > 0) {
          console.log(`⚠️  ${this.stats.errors} errors occurred during linking`);
        }
      } else {
        console.log('\n💡 To apply these changes, run:');
        console.log('   yarn link-whiskey-brands --execute');
      }
    } else {
      console.log('\n✅ No whiskeys need brand linking!');
    }
  }
}

// Configuration
function loadConfig() {
  try {
    const awsExportsPath = path.join(__dirname, '../aws-exports.js');
    
    if (fs.existsSync(awsExportsPath)) {
      const awsExports = require(awsExportsPath);
      return {
        graphqlEndpoint: awsExports.default?.aws_appsync_graphqlEndpoint || awsExports.aws_appsync_graphqlEndpoint,
        region: awsExports.default?.aws_project_region || awsExports.aws_project_region,
        userPoolId: awsExports.default?.aws_user_pools_id || awsExports.aws_user_pools_id,
        userPoolWebClientId: awsExports.default?.aws_user_pools_web_client_id || awsExports.aws_user_pools_web_client_id,
        identityPoolId: awsExports.default?.aws_cognito_identity_pool_id || awsExports.aws_cognito_identity_pool_id,
      };
    }

    return {
      graphqlEndpoint: process.env.GRAPHQL_ENDPOINT,
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
async function authenticateUser(username: string, password: string, forceRefresh: boolean = false) {
  try {
    // Sign out first to clear any cached tokens
    try {
      await Auth.signOut();
      console.log('🔓 Signed out previous session');
    } catch (e) {
      // Ignore if no session exists
    }
    
    const user = await Auth.signIn(username, password);
    console.log('✅ Authentication successful');
    
    if (forceRefresh) {
      console.log('🔄 Force refreshing session to get latest group membership...');
      try {
        const cognitoUser = await Auth.currentAuthenticatedUser();
        await cognitoUser.refreshSession(cognitoUser.signInUserSession.refreshToken, (err: any) => {
          if (err) {
            console.warn('⚠️  Could not refresh session:', err.message);
          } else {
            console.log('✅ Session refreshed successfully');
          }
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (refreshError: any) {
        console.warn('⚠️  Could not force refresh session:', refreshError.message);
      }
    }
    
    // Verify group membership
    const session = await Auth.currentSession();
    const token = session.getAccessToken().getJwtToken();
    const payload = JSON.parse(atob(token.split('.')[1]));
    const groups = payload['cognito:groups'] || [];
    
    console.log(`👤 User groups: ${groups.length > 0 ? groups.join(', ') : 'None'}`);
    
    if (!groups.includes('Admin')) {
      console.warn('⚠️  User is not in Admin group - operations may fail');
      console.warn('   Add user to Admin group: aws cognito-idp admin-add-user-to-group --user-pool-id us-east-2_7AMsBAhBE --username YOUR_USERNAME --group-name Admin');
    }
    
    return user;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    throw error;
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    execute: args.includes('--execute'),
    dryRun: args.includes('--dry-run') || args.length === 0,
    forceRefresh: args.includes('--force-refresh')
  };
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
    console.log('   Authentication Mode: Cognito User Pool (required for brand operations)');
    
    // Get credentials
    const username = process.env.COGNITO_USERNAME || process.argv[process.argv.indexOf('--username') + 1];
    const password = process.env.COGNITO_PASSWORD || process.argv[process.argv.indexOf('--password') + 1];
    
    if (!username || !password) {
      throw new Error(
        'Username and password required. ' +
        'Set COGNITO_USERNAME and COGNITO_PASSWORD environment variables or use --username and --password flags.'
      );
    }
    
    // Initialize Amplify
    initializeAmplify(config);
    
    const options = parseArgs();
    
    // Authenticate
    console.log('🔐 Authenticating user...');
    await authenticateUser(username, password, options.forceRefresh);
    
    const linker = new WhiskeyBrandLinker(config.graphqlEndpoint, { 
      execute: options.execute
    });
    
    console.log('\n');
    await linker.run();

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

export { WhiskeyBrandLinker };