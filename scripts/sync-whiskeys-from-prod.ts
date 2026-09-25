#!/usr/bin/env ts-node

import { GraphQLClient } from 'graphql-request';
import * as fs from 'fs';
import * as path from 'path';
import { Auth , Amplify } from 'aws-amplify';

// GraphQL queries and mutations
const LIST_LATEST_WHISKEYS = `
  query ListLatestWhiskeys($limit: Int, $nextToken: String) {
    listWhiskeys(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        type
        picture {
          bucket
          key
          region
        }
        brand
        brandPicture {
          bucket
          key
          region
        }
        age
        calculatedRating
        awards {
          title
          year
          picture {
            bucket
            key
            region
          }
        }
        distillery
        origin
        proof
        batch
        rick
        barrel
        bottle
        storePick
        fullName
        specialistChoice
        starterPick
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const CREATE_WHISKEY = `
  mutation CreateWhiskey($input: CreateWhiskeyInput!) {
    createWhiskey(input: $input) {
      id
      name
      brand
      createdAt
    }
  }
`;

const GET_WHISKEY = `
  query GetWhiskey($id: ID!) {
    getWhiskey(id: $id) {
      id
      name
    }
  }
`;

interface S3Object {
  bucket: string;
  key: string;
  region: string;
}

interface WhiskeyAward {
  title: string;
  year: number;
  picture?: S3Object;
}

interface Whiskey {
  id: string;
  name?: string;
  description?: string;
  type?: string[];
  picture?: S3Object;
  brand?: string;
  brandPicture?: S3Object;
  age?: number;
  calculatedRating?: number;
  awards?: WhiskeyAward[];
  distillery?: string;
  origin?: string;
  proof?: number;
  batch?: string;
  rick?: string;
  barrel?: string;
  bottle?: string;
  storePick?: string;
  fullName?: string;
  specialistChoice?: boolean;
  starterPick?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ListWhiskeysResponse {
  listWhiskeys: {
    items: Whiskey[];
    nextToken?: string;
  };
}

interface CreateWhiskeyResponse {
  createWhiskey: Whiskey;
}

interface GetWhiskeyResponse {
  getWhiskey: Whiskey | null;
}

interface WhiskeySyncConfig {
  prodEndpoint: string;
  devEndpoint: string;
  prodRegion: string;
  devRegion: string;
  prodUserPoolId: string;
  devUserPoolId: string;
  prodUserPoolWebClientId: string;
  devUserPoolWebClientId: string;
  prodIdentityPoolId: string;
  devIdentityPoolId: string;
}

class WhiskeySyncer {
  private prodClient: GraphQLClient;

  private devClient: GraphQLClient;

  private executeChanges: boolean;

  private limit: number;

  private prodAuthToken: string = '';

  private devAuthToken: string = '';

  private stats = {
    whiskeysFromProd: 0,
    alreadyExists: 0,
    created: 0,
    errors: 0,
    skipped: 0
  };

  constructor(config: WhiskeySyncConfig, options: { execute?: boolean; limit?: number } = {}) {
    this.executeChanges = options.execute || false;
    this.limit = options.limit || 100;
    
    this.prodClient = new GraphQLClient(config.prodEndpoint);
    this.devClient = new GraphQLClient(config.devEndpoint);
  }

  setAuthTokens(prodToken: string, devToken: string) {
    this.prodAuthToken = prodToken;
    this.devAuthToken = devToken;
  }

  private async getProdAuthHeaders(): Promise<Record<string, string>> {
    if (!this.prodAuthToken) {
      throw new Error('Production auth token not set');
    }
    return {
      'Authorization': this.prodAuthToken,
      'Content-Type': 'application/json',
    };
  }

  private async getDevAuthHeaders(): Promise<Record<string, string>> {
    if (!this.devAuthToken) {
      throw new Error('Development auth token not set');
    }
    return {
      'Authorization': this.devAuthToken,
      'Content-Type': 'application/json',
    };
  }

  async run(): Promise<void> {
    const mode = this.executeChanges ? '🚀 EXECUTION MODE' : '🔍 DRY RUN MODE';
    console.log(`${mode} - Whiskey Sync from Production`);
    console.log(`📊 Syncing latest ${this.limit} whiskeys from production to dev\n`);
    
    if (!this.executeChanges) {
      console.log('📋 Analysis only - NO changes will be made!');
      console.log('💡 Use --execute flag to perform actual sync\n');
    } else {
      console.log('⚠️  REAL CHANGES will be made to the dev database!\n');
    }
    
    try {
      // Step 1: Get latest whiskeys from production
      const prodWhiskeys = await this.getLatestWhiskeysFromProd();
      
      // Step 2: Sync whiskeys to dev
      await this.syncWhiskeysToDev(prodWhiskeys);
      
      // Step 3: Show results
      this.showResults();
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    }
  }

  private async getLatestWhiskeysFromProd(): Promise<Whiskey[]> {
    console.log('🏭 Fetching latest whiskeys from production...');
    
    const whiskeys: Whiskey[] = [];
    let fetched = 0;
    let nextToken: string | undefined;
    
    do {
      const response = await this.prodClient.request<ListWhiskeysResponse>(
        LIST_LATEST_WHISKEYS,
        {
          limit: Math.min(50, this.limit - fetched),
          nextToken
        },
        await this.getProdAuthHeaders()
      );
      
      const {items} = response.listWhiskeys;
      nextToken = response.listWhiskeys.nextToken;
      
      // Sort by createdAt descending to get newest first
      const sortedItems = items.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      whiskeys.push(...sortedItems);
      fetched += sortedItems.length;
      
      console.log(`  Fetched ${fetched} whiskeys so far...`);
      
    } while (nextToken && fetched < this.limit);
    
    // Take only the requested number and sort by date (newest first)
    const latestWhiskeys = whiskeys
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, this.limit);
    
    this.stats.whiskeysFromProd = latestWhiskeys.length;
    console.log(`\n✅ Retrieved ${latestWhiskeys.length} latest whiskeys from production`);
    
    if (latestWhiskeys.length > 0) {
      const newest = latestWhiskeys[0];
      const oldest = latestWhiskeys[latestWhiskeys.length - 1];
      console.log(`📅 Date range: ${new Date(oldest.createdAt).toLocaleDateString()} to ${new Date(newest.createdAt).toLocaleDateString()}`);
    }
    
    return latestWhiskeys;
  }

  private async syncWhiskeysToDev(whiskeys: Whiskey[]): Promise<void> {
    console.log('\n🔄 Syncing whiskeys to development environment...');
    
    for (let i = 0; i < whiskeys.length; i++) {
      const whiskey = whiskeys[i];
      await this.syncWhiskeyToDev(whiskey, i + 1, whiskeys.length);
      
      // Rate limiting
      await this.delay(100);
    }
  }

  private async syncWhiskeyToDev(whiskey: Whiskey, index: number, total: number): Promise<void> {
    try {
      console.log(`\n[${index}/${total}] Processing: ${whiskey.name || 'Unnamed'} (${whiskey.id})`);
      
      // Check if whiskey already exists in dev
      const exists = await this.whiskeyExistsInDev(whiskey.id);
      if (exists) {
        console.log(`  ⏭️  Already exists in dev, skipping`);
        this.stats.alreadyExists++;
        return;
      }
      
      if (!this.executeChanges) {
        console.log(`  💡 Would create whiskey: ${whiskey.name}`);
        this.stats.created++;
        return;
      }
      
      // Create whiskey in dev
      await this.createWhiskeyInDev(whiskey);
      
    } catch (error: any) {
      console.error(`  ❌ Error syncing whiskey ${whiskey.id}:`, error.message || error);
      this.stats.errors++;
    }
  }

  private async whiskeyExistsInDev(whiskeyId: string): Promise<boolean> {
    try {
      const response = await this.devClient.request<GetWhiskeyResponse>(
        GET_WHISKEY,
        { id: whiskeyId },
        await this.getDevAuthHeaders()
      );
      
      return response.getWhiskey !== null;
    } catch (error) {
      return false;
    }
  }

  private async createWhiskeyInDev(whiskey: Whiskey): Promise<void> {
    // Prepare the input data, removing read-only fields
    const input: any = {
      id: whiskey.id,
      name: whiskey.name,
      description: whiskey.description,
      type: whiskey.type,
      picture: whiskey.picture,
      brand: whiskey.brand,
      // Note: brandId will be set later by the link-whiskey-brands script
      brandPicture: whiskey.brandPicture,
      age: whiskey.age,
      calculatedRating: whiskey.calculatedRating,
      awards: whiskey.awards,
      distillery: whiskey.distillery,
      origin: whiskey.origin,
      proof: whiskey.proof,
      batch: whiskey.batch,
      rick: whiskey.rick,
      barrel: whiskey.barrel,
      bottle: whiskey.bottle,
      storePick: whiskey.storePick,
      fullName: whiskey.fullName,
      specialistChoice: whiskey.specialistChoice,
      starterPick: whiskey.starterPick
    };
    
    // Remove undefined values
    Object.keys(input).forEach(key => {
      if (input[key] === undefined) {
        delete input[key];
      }
    });
    
    const response = await this.devClient.request<CreateWhiskeyResponse>(
      CREATE_WHISKEY,
      { input },
      await this.getDevAuthHeaders()
    );
    
    console.log(`  ✅ Created whiskey: ${response.createWhiskey.name}`);
    this.stats.created++;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private showResults(): void {
    console.log('\n📊 SYNC RESULTS\n');
    
    console.log('📈 SUMMARY:');
    console.log(`Whiskeys fetched from production: ${this.stats.whiskeysFromProd}`);
    console.log(`Already existed in dev: ${this.stats.alreadyExists}`);
    console.log(`Successfully created in dev: ${this.stats.created}`);
    console.log(`Errors encountered: ${this.stats.errors}`);
    
    const successRate = this.stats.whiskeysFromProd > 0 
      ? ((this.stats.created + this.stats.alreadyExists) / this.stats.whiskeysFromProd * 100).toFixed(1)
      : '0';
    
    console.log(`\n📊 Success rate: ${successRate}%`);
    
    if (this.stats.created > 0) {
      if (this.executeChanges) {
        console.log(`\n✅ Successfully synced ${this.stats.created} new whiskeys to dev`);
        if (this.stats.errors > 0) {
          console.log(`⚠️  ${this.stats.errors} errors occurred during sync`);
        }
      } else {
        console.log('\n💡 To apply these changes, run:');
        console.log('   yarn sync-whiskeys-from-prod --execute');
      }
    } else if (this.stats.alreadyExists === this.stats.whiskeysFromProd) {
      console.log('\n✅ All whiskeys are already up to date in dev!');
    }
  }
}

// Configuration
function loadConfig(): WhiskeySyncConfig {
  try {
    // Load dev config from aws-exports.js
    const awsExportsPath = path.join(__dirname, '../aws-exports.js');
    
    if (!fs.existsSync(awsExportsPath)) {
      throw new Error('aws-exports.js not found. Please ensure you are in a valid Amplify project.');
    }
    
    const awsExports = require(awsExportsPath);
    
    // Load production config from aws-exports.prod.js
    const awsExportsProdPath = path.join(__dirname, '../aws-exports.prod.js');
    
    if (!fs.existsSync(awsExportsProdPath)) {
      throw new Error(
        'aws-exports.prod.js not found. Please create this file with your production AWS configuration.\n' +
        'Example structure:\n' +
        'const awsmobile = {\n' +
        '  "aws_appsync_graphqlEndpoint": "https://your-prod-endpoint.appsync-api.region.amazonaws.com/graphql",\n' +
        '  "aws_project_region": "us-east-2",\n' +
        '  "aws_user_pools_id": "region_XXXXXXXXX",\n' +
        '  "aws_user_pools_web_client_id": "xxxxxxxxxxxxxxxxxxxxxxxxxx",\n' +
        '  "aws_cognito_identity_pool_id": "region:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"\n' +
        '};\n' +
        'export default awsmobile;'
      );
    }
    
    const awsExportsProd = require(awsExportsProdPath);
    
    // Extract production configuration
    const prodEndpoint = awsExportsProd.default?.aws_appsync_graphqlEndpoint || awsExportsProd.aws_appsync_graphqlEndpoint;
    const prodRegion = awsExportsProd.default?.aws_project_region || awsExportsProd.aws_project_region;
    const prodUserPoolId = awsExportsProd.default?.aws_user_pools_id || awsExportsProd.aws_user_pools_id;
    const prodUserPoolWebClientId = awsExportsProd.default?.aws_user_pools_web_client_id || awsExportsProd.aws_user_pools_web_client_id;
    const prodIdentityPoolId = awsExportsProd.default?.aws_cognito_identity_pool_id || awsExportsProd.aws_cognito_identity_pool_id;
    
    if (!prodEndpoint || !prodUserPoolId || !prodUserPoolWebClientId) {
      throw new Error(
        'Production configuration incomplete in aws-exports.prod.js. Please ensure it contains:\n' +
        '- aws_appsync_graphqlEndpoint\n' +
        '- aws_user_pools_id\n' +
        '- aws_user_pools_web_client_id'
      );
    }
    
    return {
      prodEndpoint,
      devEndpoint: awsExports.default?.aws_appsync_graphqlEndpoint || awsExports.aws_appsync_graphqlEndpoint,
      prodRegion: prodRegion || 'us-east-2',
      devRegion: awsExports.default?.aws_project_region || awsExports.aws_project_region,
      prodUserPoolId,
      devUserPoolId: awsExports.default?.aws_user_pools_id || awsExports.aws_user_pools_id,
      prodUserPoolWebClientId,
      devUserPoolWebClientId: awsExports.default?.aws_user_pools_web_client_id || awsExports.aws_user_pools_web_client_id,
      prodIdentityPoolId: prodIdentityPoolId || '',
      devIdentityPoolId: awsExports.default?.aws_cognito_identity_pool_id || awsExports.aws_cognito_identity_pool_id
    };
  } catch (error) {
    console.error('❌ Error loading configuration:', error);
    throw error;
  }
}

// Initialize AWS Amplify for production
function initializeAmplifyForProd(config: WhiskeySyncConfig) {
  Amplify.configure({
    Auth: {
      region: config.prodRegion,
      userPoolId: config.prodUserPoolId,
      userPoolWebClientId: config.prodUserPoolWebClientId,
      identityPoolId: config.prodIdentityPoolId,
    },
  });
}

// Initialize AWS Amplify for dev
function initializeAmplifyForDev(config: WhiskeySyncConfig) {
  Amplify.configure({
    Auth: {
      region: config.devRegion,
      userPoolId: config.devUserPoolId,
      userPoolWebClientId: config.devUserPoolWebClientId,
      identityPoolId: config.devIdentityPoolId,
    },
  });
}

// Authenticate user
async function authenticateUser(username: string, password: string, environment: 'prod' | 'dev') {
  try {
    // Sign out first
    try {
      await Auth.signOut();
      console.log(`🔓 Signed out previous session`);
    } catch (e) {
      // Ignore if no session exists
    }
    
    const user = await Auth.signIn(username, password);
    console.log(`✅ Authentication successful for ${environment}`);
    
    // Verify group membership
    const session = await Auth.currentSession();
    const token = session.getAccessToken().getJwtToken();
    const payload = JSON.parse(atob(token.split('.')[1]));
    const groups = payload['cognito:groups'] || [];
    
    console.log(`👤 User groups: ${groups.length > 0 ? groups.join(', ') : 'None'}`);
    
    if (!groups.includes('Admin')) {
      console.warn(`⚠️  User is not in Admin group for ${environment} - operations may fail`);
    }
    
    return user;
  } catch (error) {
    console.error(`❌ Authentication failed for ${environment}:`, error);
    throw error;
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 && args[limitIndex + 1] ? parseInt(args[limitIndex + 1], 10) : 100;
  
  return {
    execute: args.includes('--execute'),
    limit: Math.min(Math.max(limit, 1), 500) // Between 1 and 500
  };
}

// Main execution
async function main() {
  try {
    const config = loadConfig();
    const options = parseArgs();
    
    console.log('🔧 Configuration loaded:');
    console.log(`   Production GraphQL: ${config.prodEndpoint}`);
    console.log(`   Development GraphQL: ${config.devEndpoint}`);
    console.log(`   Limit: ${options.limit} whiskeys`);
    
    // Get credentials
    const prodUsername = process.env.PROD_COGNITO_USERNAME || process.argv[process.argv.indexOf('--prod-username') + 1];
    const prodPassword = process.env.PROD_COGNITO_PASSWORD || process.argv[process.argv.indexOf('--prod-password') + 1];
    
    // For dev, try environment variables first, then fall back to same as prod
    const devUsername = process.env.DEV_COGNITO_USERNAME || process.argv[process.argv.indexOf('--dev-username') + 1] || prodUsername;
    const devPassword = process.env.DEV_COGNITO_PASSWORD || process.argv[process.argv.indexOf('--dev-password') + 1] || prodPassword;
    
    if (!prodUsername || !prodPassword) {
      throw new Error(
        'Credentials required. Set PROD_COGNITO_USERNAME and PROD_COGNITO_PASSWORD environment variables or use --prod-username and --prod-password flags.\n' +
        'If dev credentials are different, set DEV_COGNITO_USERNAME and DEV_COGNITO_PASSWORD or use --dev-username and --dev-password flags.'
      );
    }
    
    // Authenticate to production first
    console.log('\n🔐 Authenticating to production...');
    initializeAmplifyForProd(config);
    await authenticateUser(prodUsername, prodPassword, 'prod');
    
    // Get production token
    const prodSession = await Auth.currentSession();
    const prodToken = prodSession.getAccessToken().getJwtToken();
    
    // Switch to dev environment
    console.log('\n🔐 Switching to development environment...');
    initializeAmplifyForDev(config);
    await authenticateUser(devUsername, devPassword, 'dev');
    
    // Get dev token
    const devSession = await Auth.currentSession();
    const devToken = devSession.getAccessToken().getJwtToken();
    
    // Create syncer and set tokens
    const syncer = new WhiskeySyncer(config, {
      execute: options.execute,
      limit: options.limit
    });
    
    syncer.setAuthTokens(prodToken, devToken);
    
    console.log('\n');
    await syncer.run();

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

export { WhiskeySyncer };