#!/usr/bin/env ts-node

import { GraphQLClient } from 'graphql-request';
import * as fs from 'fs';
import * as path from 'path';
import { Auth } from 'aws-amplify';
import {
  loadAwsConfig,
  initializeAmplify,
  authenticate,
} from './deployment/helpers/auth';

// GraphQL queries and mutations
const LIST_APP_VERSIONS = `
  query ListAppVersions($filter: ModelAppVersionFilterInput) {
    listAppVersions(filter: $filter) {
      items {
        id
        platform
        currentVersion
        minimumVersion
        createdAt
        updatedAt
      }
    }
  }
`;

const CREATE_APP_VERSION = `
  mutation CreateAppVersion($input: CreateAppVersionInput!) {
    createAppVersion(input: $input) {
      id
      platform
      currentVersion
      minimumVersion
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_APP_VERSION = `
  mutation UpdateAppVersion($input: UpdateAppVersionInput!) {
    updateAppVersion(input: $input) {
      id
      platform
      currentVersion
      minimumVersion
      createdAt
      updatedAt
    }
  }
`;

interface AppVersion {
  id: string;
  platform: string;
  currentVersion: string;
  minimumVersion: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Compare semantic versions (e.g., "1.2.3")
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

interface ListAppVersionsResponse {
  listAppVersions: {
    items: AppVersion[];
  };
}

interface CreateAppVersionInput {
  platform: string;
  currentVersion: string;
  minimumVersion: string;
}

interface UpdateAppVersionInput {
  id: string;
  currentVersion: string;
  minimumVersion?: string;
}

class AppVersionSyncService {
  private client: GraphQLClient;

  private apiKey?: string;

  private endpoint: string;

  private stats = {
    totalPlatforms: 0,
    versionsCreated: 0,
    versionsUpdated: 0,
    versionsSkipped: 0,
    errors: 0,
  };

  private useAuth: boolean;

  constructor(graphqlEndpoint: string, apiKey?: string, useAuth = false) {
    this.useAuth = useAuth;
    this.apiKey = apiKey;
    this.endpoint = graphqlEndpoint;
    
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      console.error('❌ Failed to get auth headers:', error);
      throw new Error('Authentication failed. Please check your credentials.');
    }
  }

  private readAppJsonVersion(): string {
    try {
      const appConfigPath = path.join(__dirname, '..', 'app.config.js');
      const content = fs.readFileSync(appConfigPath, 'utf8');
      const match = content.match(/\bversion:\s*["']([^"']+)["']/);

      if (!match) {
        throw new Error('Version not found in app.config.js expo.version');
      }

      return match[1];
    } catch (error) {
      console.error('❌ Failed to read app.config.js:', error);
      throw error;
    }
  }

  private async getExistingVersions(): Promise<AppVersion[]> {
    try {
      // Use a separate client with API key for reading since it's public
      const readClient = new GraphQLClient(
        this.endpoint,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey || '',
          },
        }
      );
      
      const response = await readClient.request<ListAppVersionsResponse>(
        LIST_APP_VERSIONS,
        {}
      );
      
      return response.listAppVersions.items;
    } catch (error) {
      console.error('❌ Failed to fetch existing app versions:', error);
      throw error;
    }
  }

  private async createAppVersion(input: CreateAppVersionInput): Promise<AppVersion> {
    try {
      const response = await this.client.request<{ createAppVersion: AppVersion }>(
        CREATE_APP_VERSION,
        { input },
        this.useAuth ? await this.getAuthHeaders() : undefined
      );
      
      return response.createAppVersion;
    } catch (error) {
      console.error(`❌ Failed to create app version for ${input.platform}:`, error);
      throw error;
    }
  }

  private async updateAppVersion(input: UpdateAppVersionInput): Promise<AppVersion> {
    try {
      const response = await this.client.request<{ updateAppVersion: AppVersion }>(
        UPDATE_APP_VERSION,
        { input },
        this.useAuth ? await this.getAuthHeaders() : undefined
      );
      
      return response.updateAppVersion;
    } catch (error) {
      console.error(`❌ Failed to update app version ${input.id}:`, error);
      throw error;
    }
  }

  public async syncAppVersions(
    customMinimumVersion?: string | null,
    targetPlatform?: string
  ): Promise<void> {
    console.log('📱 Starting app version sync...\n');

    try {
      // Read version from app.config.js
      const currentVersion = this.readAppJsonVersion();
      console.log(`📄 Current version from app.config.js: ${currentVersion}`);

      // Validate minimum version is not greater than current version
      if (customMinimumVersion && compareVersions(customMinimumVersion, currentVersion) > 0) {
        throw new Error(
          `Invalid minimum version: ${customMinimumVersion} is greater than current version ${currentVersion}. ` +
          `Minimum version must be less than or equal to current version.`
        );
      }

      // Get existing versions from database
      const existingVersions = await this.getExistingVersions();
      console.log(`📊 Found ${existingVersions.length} existing version entries in database`);

      // Determine which platforms to manage based on targetPlatform
      let platforms: string[];
      if (targetPlatform === 'ios') {
        platforms = ['ios'];
      } else if (targetPlatform === 'android') {
        platforms = ['android'];
      } else {
        // 'all', 'both', or undefined = all platforms
        platforms = ['ios', 'android', 'all'];
      }
      this.stats.totalPlatforms = platforms.length;
      console.log(`🎯 Target platform(s): ${platforms.join(', ')}`);

      // Process each platform
      for (const platform of platforms) {
        console.log(`\n🔧 Processing platform: ${platform}`);

        const existingVersion = existingVersions.find(v => v.platform === platform);

        if (existingVersion) {
          // Validate new version is not older than existing version
          const versionComparison = compareVersions(currentVersion, existingVersion.currentVersion);
          if (versionComparison < 0) {
            throw new Error(
              `Cannot downgrade version for ${platform}: ` +
              `Current version in database is ${existingVersion.currentVersion}, ` +
              `but new version is ${currentVersion}. New version must be greater than or equal to existing version.`
            );
          }

          // Update existing version
          const needsVersionUpdate = existingVersion.currentVersion !== currentVersion;
          const needsMinVersionUpdate = customMinimumVersion && existingVersion.minimumVersion !== customMinimumVersion;

          if (needsVersionUpdate || needsMinVersionUpdate) {
            if (needsVersionUpdate) {
              console.log(`   📝 Updating version from ${existingVersion.currentVersion} to ${currentVersion}`);
            }
            if (needsMinVersionUpdate) {
              console.log(`   🔒 Updating minimum version from ${existingVersion.minimumVersion} to ${customMinimumVersion}`);
            }

            await this.updateAppVersion({
              id: existingVersion.id,
              currentVersion,
              minimumVersion: customMinimumVersion || existingVersion.minimumVersion,
            });

            console.log(`   ✅ Updated ${platform} version to ${currentVersion} (min: ${customMinimumVersion || existingVersion.minimumVersion})`);
            this.stats.versionsUpdated++;
          } else {
            console.log(`   ⏭️  Version already up to date (${currentVersion})`);
            this.stats.versionsSkipped++;
          }
        } else {
          // Create new version entry
          console.log(`   ➕ Creating new version entry for ${platform}`);

          const minimumVersion = customMinimumVersion || currentVersion;
          await this.createAppVersion({
            platform,
            currentVersion,
            minimumVersion, // Use custom minimum version or default to current
          });

          console.log(`   ✅ Created ${platform} version entry: ${currentVersion} (min: ${minimumVersion})`);
          this.stats.versionsCreated++;
        }
      }

      this.printSummary();

    } catch (error) {
      console.error('\n❌ Sync process failed:', error);
      this.stats.errors++;
      throw error;
    }
  }

  private printSummary(): void {
    console.log('\n📊 Sync Summary:');
    console.log('─'.repeat(50));
    console.log(`   Total platforms processed: ${this.stats.totalPlatforms}`);
    console.log(`   ➕ Versions created: ${this.stats.versionsCreated}`);
    console.log(`   📝 Versions updated: ${this.stats.versionsUpdated}`);
    console.log(`   ⏭️  Versions skipped: ${this.stats.versionsSkipped}`);
    console.log(`   ❌ Errors: ${this.stats.errors}`);
    console.log('─'.repeat(50));
    
    if (this.stats.errors === 0) {
      console.log('✅ App version sync completed successfully!');
    } else {
      console.log('⚠️  App version sync completed with errors.');
    }
  }
}

// Main execution function
async function main() {
  console.log('🚀 App Version Sync Script Starting...\n');

  try {
    // Check for execute flag
    const shouldExecute = process.argv.includes('--execute');

    if (!shouldExecute) {
      console.log('🔍 DRY RUN MODE - Use --execute flag to actually perform sync operations\n');
      console.log('This script will:');
      console.log('1. Confirm app.config.js has been updated');
      console.log('2. Read the current version from app.config.js');
      console.log('3. Update src/version.json with the current version');
      console.log('4. Check existing app version entries in the database');
      console.log('5. Create or update version entries for selected platforms');
      console.log('\nAvailable flags:');
      console.log('  --execute                     Actually perform sync operations');
      console.log('  --username <username>         Cognito username');
      console.log('  --password <password>         Cognito password');
      console.log('  --minimum-version <version>   Set custom minimum version (optional)');
      console.log('  --platform <platform>         Target platform: ios, android, or all (optional)');
      console.log('\nExamples:');
      console.log('  yarn sync-app-version:execute');
      console.log('  yarn sync-app-version:execute --minimum-version 1.0.0');
      console.log('  yarn sync-app-version:execute --platform ios');
      console.log('  ts-node sync-app-version.ts --execute --minimum-version 1.2.0 --platform android');
      return;
    }

    // Load configuration
    const config = loadAwsConfig();

    if (!config.graphqlEndpoint) {
      throw new Error(
        'GraphQL endpoint not found. Please ensure aws-exports.js exists or set GRAPHQL_ENDPOINT environment variable.'
      );
    }

    // Read current version from app.config.js
    const currentVersion = readAppJsonVersion();
    console.log(`📄 Current version from app.config.js: ${currentVersion}`);

    // Confirmation prompt - must confirm app.config.js has been updated
    const confirmed = await prompt(`Has app.config.js expo version been updated? It is currently set to ${currentVersion}. (y/n): `);
    if (confirmed.toLowerCase() !== 'y' && confirmed.toLowerCase() !== 'yes') {
      console.log('\n⚠️  Please update app.config.js expo.version first, then run this script again.');
      return;
    }

    // Get minimum version from command line arguments or prompt
    const minimumVersionIndex = process.argv.indexOf('--minimum-version');
    let customMinimumVersion = minimumVersionIndex !== -1 && minimumVersionIndex + 1 < process.argv.length
      ? process.argv[minimumVersionIndex + 1]
      : null;

    if (!customMinimumVersion) {
      customMinimumVersion = await prompt(`Enter minimum supported version (or press Enter to use ${currentVersion}): `);
      if (!customMinimumVersion) {
        customMinimumVersion = currentVersion;
      }
    }
    console.log(`🔒 Minimum version: ${customMinimumVersion}`);

    // Get platform from command line arguments or prompt
    const validPlatforms = ['ios', 'android', 'all'];
    const platformIndex = process.argv.indexOf('--platform');
    let platform = platformIndex !== -1 && platformIndex + 1 < process.argv.length
      ? process.argv[platformIndex + 1]
      : null;

    if (!platform) {
      platform = await prompt('Select platforms (ios/android/all) [default: all]: ');
    }
    if (!platform || !validPlatforms.includes(platform)) {
      if (platform && !validPlatforms.includes(platform)) {
        console.log(`⚠️  Invalid platform '${platform}', defaulting to 'all'`);
      }
      platform = 'all';
    }
    console.log(`📱 Platform: ${platform}`);

    // Sync src/version.json
    console.log('\n📝 Syncing src/version.json...');
    syncVersionJson(currentVersion);

    console.log('\n🔧 Configuration loaded:');
    console.log(`   GraphQL Endpoint: ${config.graphqlEndpoint}`);
    console.log('   Authentication Mode: Cognito User Pool (required for sync operations)');

    // Get credentials from environment or command line
    const username = process.env.COGNITO_USERNAME || process.argv[process.argv.indexOf('--username') + 1];
    const password = process.env.COGNITO_PASSWORD || process.argv[process.argv.indexOf('--password') + 1];

    if (!username || !password) {
      throw new Error(
        'Username and password required for sync operation. ' +
        'Set COGNITO_USERNAME and COGNITO_PASSWORD environment variables or use --username and --password flags.'
      );
    }

    // Initialize Amplify and authenticate
    console.log('🔐 Authenticating user...');
    initializeAmplify(config);
    await authenticate(username, password);

    // Pass API key for read operations, use auth for write operations
    const syncService = new AppVersionSyncService(config.graphqlEndpoint, config.apiKey, true);

    console.log('\n');
    await syncService.syncAppVersions(customMinimumVersion, platform);

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

// Export class for use by other scripts
// Auth helpers are now available from './deployment/helpers/auth'
export { AppVersionSyncService };

/**
 * Sync src/version.json with app.config.js version
 */
function syncVersionJson(version: string): void {
  const versionJsonPath = path.join(__dirname, '..', 'src', 'version.json');

  try {
    const versionData = { version };
    fs.writeFileSync(versionJsonPath, `${JSON.stringify(versionData, null, 2)  }\n`);
    console.log(`✅ Updated src/version.json to ${version}`);
  } catch (error) {
    console.error('❌ Failed to update src/version.json:', error);
    throw error;
  }
}

/**
 * Read current version from app.config.js
 */
function readAppJsonVersion(): string {
  const appConfigPath = path.join(__dirname, '..', 'app.config.js');
  const content = fs.readFileSync(appConfigPath, 'utf8');
  const match = content.match(/\bversion:\s*["']([^"']+)["']/);

  if (!match) {
    throw new Error('Version not found in app.config.js expo.version');
  }

  return match[1];
}

/**
 * Prompt helper for interactive mode
 */
async function prompt(question: string): Promise<string> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Run function for deployment runner integration
 *
 * This function is called by the deployment runner with args from run-list.json.
 * If args are provided, they are used directly. If not, the user is prompted.
 */
export async function run(args: {
  execute?: boolean;
  confirmed?: boolean;
  minimumVersion?: string;
  platform?: string;
} = {}): Promise<void> {
  console.log('🚀 App Version Sync Script Starting...\n');

  try {
    // Load configuration
    const config = loadAwsConfig();

    if (!config.graphqlEndpoint) {
      throw new Error(
        'GraphQL endpoint not found. Please ensure aws-exports.js exists or set GRAPHQL_ENDPOINT environment variable.'
      );
    }

    // Read current version from app.config.js
    const currentVersion = readAppJsonVersion();
    console.log(`📄 Current version from app.config.js: ${currentVersion}`);

    // Confirmation prompt - skip if args.confirmed is true (automated mode)
    if (!args.confirmed) {
      const userConfirmed = await prompt(`Has app.config.js expo version been updated from the current value ${currentVersion}? (y/n): `);
      if (userConfirmed.toLowerCase() !== 'y' && userConfirmed.toLowerCase() !== 'yes') {
        console.log('\n⚠️  Please update app.config.js expo.version first, then run this script again.');
        return;
      }
    } else {
      console.log('✓ Confirmation skipped (automated mode)');
    }

    // Get minimum version - use args or prompt
    let {minimumVersion} = args;
    if (!minimumVersion) {
      minimumVersion = await prompt(`Enter minimum supported version (or press Enter to use ${currentVersion}): `);
      if (!minimumVersion) {
        minimumVersion = currentVersion;
      }
    }
    console.log(`🔒 Minimum version: ${minimumVersion}`);

    // Get platform - use args or prompt
    const validPlatforms = ['ios', 'android', 'all'];
    let {platform} = args;
    if (!platform) {
      platform = await prompt('Select platforms (ios/android/all) [default: all]: ');
    }
    if (!platform || !validPlatforms.includes(platform)) {
      if (platform && !validPlatforms.includes(platform)) {
        console.log(`⚠️  Invalid platform '${platform}', defaulting to 'all'`);
      }
      platform = 'all';
    }
    console.log(`📱 Platform: ${platform}`);

    // Sync src/version.json
    console.log('\n📝 Syncing src/version.json...');
    syncVersionJson(currentVersion);

    // Check execute flag
    if (!args.execute) {
      console.log('\n🔍 DRY RUN MODE - Use execute: true to perform database sync');
      console.log('   src/version.json has been updated, but database was not modified.');
      return;
    }

    // Initialize Amplify and authenticate
    console.log('\n🔐 Authenticating...');
    initializeAmplify(config);
    await authenticate();

    // Create sync service and run
    const syncService = new AppVersionSyncService(config.graphqlEndpoint, config.apiKey, true);

    console.log('\n');
    await syncService.syncAppVersions(minimumVersion, platform);

    console.log('\n✅ App version sync completed successfully!');
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    throw error;
  }
}