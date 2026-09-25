#!/usr/bin/env ts-node

import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GraphQLClient } from 'graphql-request';
import * as fs from 'fs';
import * as path from 'path';

// GraphQL query to get user details
const GET_USER = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      userType
      personFirstName
      personLastName
      personFullName
      venueName
      brandName
      bio
      isMyCollectionPublic
      followers
      following
      isOnRewards
      createdAt
      updatedAt
    }
  }
`;

interface CognitoUser {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string;
  createdAt: Date;
}

interface UserDetails {
  id: string;
  username: string;
  userType: string;
  personFirstName?: string;
  personLastName?: string;
  personFullName?: string;
  venueName?: string;
  brandName?: string;
  bio?: string;
  isMyCollectionPublic?: boolean;
  followers?: number;
  following?: number;
  isOnRewards?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewsletterUser {
  cognitoId: string;
  email: string;
  username: string;
  userType: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  followers: number;
  following: number;
  isPublicCollection: boolean;
  isOnRewards: boolean;
  accountCreatedAt: string;
  lastUpdatedAt: string;
}

interface ExportConfig {
  userPoolId: string;
  region: string;
  graphqlEndpoint: string;
  apiKey: string;
  outputFormat: 'json' | 'csv';
  outputFile?: string;
  isProd: boolean;
}

class NewsletterUserExporter {
  private cognitoClient: CognitoIdentityProviderClient;

  private graphqlClient: GraphQLClient;

  private config: ExportConfig;

  private stats = {
    totalCognitoUsers: 0,
    verifiedUsers: 0,
    filteredDomain: 0,
    notInDynamoDB: 0,
    enrichedUsers: 0,
    errors: 0,
  };

  constructor(config: ExportConfig) {
    this.config = config;

    // Initialize Cognito client
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: config.region,
    });

    // Initialize GraphQL client
    this.graphqlClient = new GraphQLClient(config.graphqlEndpoint, {
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async run(): Promise<void> {
    console.log('📧 Newsletter User Export Tool');
    console.log(`📍 User Pool: ${this.config.userPoolId}`);
    console.log(`🌍 Region: ${this.config.region}`);
    console.log(`📊 Mode: ${this.config.isProd ? 'PRODUCTION' : 'Development'}\n`);

    try {
      // Step 1: Fetch verified users from Cognito
      const cognitoUsers = await this.fetchVerifiedCognitoUsers();

      // Step 2: Enrich with DynamoDB data
      const newsletterUsers = await this.enrichWithDynamoData(cognitoUsers);

      // Step 3: Export to file
      await this.exportToFile(newsletterUsers);

      // Step 4: Show summary
      this.showSummary();
    } catch (error) {
      console.error('❌ Export failed:', error);
      process.exit(1);
    }
  }

  private async fetchVerifiedCognitoUsers(): Promise<CognitoUser[]> {
    console.log('📥 Fetching verified users from Cognito...\n');

    const verifiedUsers: CognitoUser[] = [];
    let paginationToken: string | undefined;
    let totalFetched = 0;

    do {
      try {
        const command = new ListUsersCommand({
          UserPoolId: this.config.userPoolId,
          Limit: 60, // Max allowed by AWS
          PaginationToken: paginationToken,
        });

        const response = await this.cognitoClient.send(command);

        if (response.Users) {
          for (const user of response.Users) {
            this.stats.totalCognitoUsers++;

            const attributes = user.Attributes || [];
            const emailVerifiedAttr = attributes.find(attr => attr.Name === 'email_verified');
            const emailAttr = attributes.find(attr => attr.Name === 'email');
            const subAttr = attributes.find(attr => attr.Name === 'sub');

            // Only include users with verified emails and exclude @whiskeysocial.app domain
            if (emailVerifiedAttr?.Value === 'true' && emailAttr?.Value && subAttr?.Value) {
              const email = emailAttr.Value;

              // Skip @whiskeysocial.app emails
              if (email.endsWith('@whiskeysocial.app')) {
                this.stats.filteredDomain++;
                continue;
              }

              verifiedUsers.push({
                id: subAttr.Value,
                email,
                emailVerified: true,
                username: user.Username || '',
                createdAt: user.UserCreateDate || new Date(),
              });
              this.stats.verifiedUsers++;
            }
          }

          totalFetched += response.Users.length;
          console.log(`  Processed ${totalFetched} Cognito users, found ${this.stats.verifiedUsers} verified...`);
        }

        paginationToken = response.PaginationToken;
      } catch (error: any) {
        console.error('❌ Error fetching Cognito users:', error.message);
        throw error;
      }
    } while (paginationToken);

    console.log(`✅ Found ${verifiedUsers.length} users with verified emails\n`);
    return verifiedUsers;
  }

  private async enrichWithDynamoData(cognitoUsers: CognitoUser[]): Promise<NewsletterUser[]> {
    console.log('🔍 Enriching with DynamoDB data...\n');

    const newsletterUsers: NewsletterUser[] = [];

    for (let i = 0; i < cognitoUsers.length; i++) {
      const cognitoUser = cognitoUsers[i];

      try {
        console.log(`  [${i + 1}/${cognitoUsers.length}] Processing ${cognitoUser.email}...`);

        // Fetch user details from DynamoDB via GraphQL
        const response = await this.graphqlClient.request<{ getUser: UserDetails }>(
          GET_USER,
          { id: cognitoUser.id }
        );

        const dynamoUser = response.getUser;

        if (dynamoUser) {
          // Determine display name based on user type
          let displayName = cognitoUser.username;
          if (dynamoUser.userType === 'person' && dynamoUser.personFullName) {
            displayName = dynamoUser.personFullName;
          } else if (dynamoUser.userType === 'venue' && dynamoUser.venueName) {
            displayName = dynamoUser.venueName;
          } else if (dynamoUser.userType === 'brand' && dynamoUser.brandName) {
            displayName = dynamoUser.brandName;
          }

          newsletterUsers.push({
            cognitoId: cognitoUser.id,
            email: cognitoUser.email,
            username: dynamoUser.username,
            userType: dynamoUser.userType || 'person',
            displayName,
            firstName: dynamoUser.personFirstName,
            lastName: dynamoUser.personLastName,
            bio: dynamoUser.bio,
            followers: dynamoUser.followers || 0,
            following: dynamoUser.following || 0,
            isPublicCollection: dynamoUser.isMyCollectionPublic || false,
            isOnRewards: dynamoUser.isOnRewards || false,
            accountCreatedAt: cognitoUser.createdAt.toISOString(),
            lastUpdatedAt: dynamoUser.updatedAt,
          });

          this.stats.enrichedUsers++;
        } else {
          // User exists in Cognito but not in DynamoDB - skip them (never logged in)
          console.log(`    ⚠️  No DynamoDB record found, skipping user (never logged in)`);
          this.stats.notInDynamoDB++;
        }

        // Rate limiting to avoid overwhelming the API
        await this.delay(100);
      } catch (error: any) {
        console.error(`    ❌ Error enriching user ${cognitoUser.email}:`, error.message);
        this.stats.errors++;
        // Skip users with errors - they likely don't exist in DynamoDB
      }
    }

    console.log(`\n✅ Successfully enriched ${this.stats.enrichedUsers}/${cognitoUsers.length} users\n`);
    return newsletterUsers;
  }

  private async exportToFile(users: NewsletterUser[]): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const mode = this.config.isProd ? 'prod' : 'dev';
    const defaultFilename = `newsletter-users-${mode}-${timestamp}.${this.config.outputFormat}`;
    const outputPath = this.config.outputFile || path.join(process.cwd(), defaultFilename);

    console.log(`💾 Exporting ${users.length} users to ${outputPath}...`);

    let content: string;

    if (this.config.outputFormat === 'csv') {
      content = this.generateCSV(users);
    } else {
      content = this.generateJSON(users);
    }

    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`✅ Export complete: ${outputPath}\n`);
  }

  private generateCSV(users: NewsletterUser[]): string {
    const headers = [
      'Email',
      'Display Name',
      'Username',
      'User Type',
      'First Name',
      'Last Name',
      'Account Created',
      'Last Updated',
      'Cognito ID'
    ];

    const rows = users.map(user => [
      user.email,
      user.displayName,
      user.username,
      user.userType,
      user.firstName || '',
      user.lastName || '',
      user.accountCreatedAt,
      user.lastUpdatedAt,
      user.cognitoId
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }

  private generateJSON(users: NewsletterUser[]): string {
    return JSON.stringify(users, null, 2);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private showSummary(): void {
    console.log('📊 EXPORT SUMMARY\n');
    console.log(`Total Cognito users scanned: ${this.stats.totalCognitoUsers}`);
    console.log(`Users with verified emails: ${this.stats.verifiedUsers}`);
    console.log(`Filtered @whiskeysocial.app domain: ${this.stats.filteredDomain}`);
    console.log(`Not in DynamoDB (never logged in): ${this.stats.notInDynamoDB}`);
    console.log(`Errors encountered: ${this.stats.errors}`);
    console.log(`Successfully exported to file: ${this.stats.enrichedUsers}\n`);

    console.log('✅ Newsletter user export complete!');
    console.log('   Only includes users who:');
    console.log('   - Have verified email addresses');
    console.log('   - Do NOT use @whiskeysocial.app domain');
    console.log('   - Have logged into the app (exist in DynamoDB)');
  }
}

// Load AWS configuration
function loadConfig(isProd: boolean): { userPoolId: string; region: string; graphqlEndpoint: string; apiKey: string } {
  try {
    const configFile = isProd ? 'aws-exports.prod.js' : 'aws-exports.js';
    const configPath = path.join(__dirname, '..', configFile);

    if (!fs.existsSync(configPath)) {
      throw new Error(`${configFile} not found at ${configPath}`);
    }

    const awsConfig = require(configPath);
    const config = awsConfig.default || awsConfig;

    const userPoolId = config.aws_user_pools_id;
    const region = config.aws_project_region;
    const graphqlEndpoint = config.aws_appsync_graphqlEndpoint;
    const apiKey = config.aws_appsync_apiKey;

    if (!userPoolId || !region || !graphqlEndpoint || !apiKey) {
      throw new Error(
        `Configuration incomplete in ${configFile}. Required fields:\n` +
        '- aws_user_pools_id\n' +
        '- aws_project_region\n' +
        '- aws_appsync_graphqlEndpoint\n' +
        '- aws_appsync_apiKey'
      );
    }

    return { userPoolId, region, graphqlEndpoint, apiKey };
  } catch (error) {
    console.error('❌ Error loading configuration:', error);
    throw error;
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  const formatIndex = args.indexOf('--format');
  const format = formatIndex !== -1 && args[formatIndex + 1] ? args[formatIndex + 1] : 'csv';

  const outputIndex = args.indexOf('--output');
  const output = outputIndex !== -1 && args[outputIndex + 1] ? args[outputIndex + 1] : undefined;

  const isProd = args.includes('--prod');

  if (!['json', 'csv'].includes(format)) {
    throw new Error('Invalid format. Use --format json or --format csv');
  }

  return {
    format: format as 'json' | 'csv',
    output,
    isProd,
  };
}

// Main execution
async function main() {
  try {
    const options = parseArgs();
    const awsConfig = loadConfig(options.isProd);

    const config: ExportConfig = {
      userPoolId: awsConfig.userPoolId,
      region: awsConfig.region,
      graphqlEndpoint: awsConfig.graphqlEndpoint,
      apiKey: awsConfig.apiKey,
      outputFormat: options.format,
      outputFile: options.output,
      isProd: options.isProd,
    };

    const exporter = new NewsletterUserExporter(config);
    await exporter.run();
  } catch (error: any) {
    console.error('\n❌ Script failed:', error.message || error);
    console.log('\nUsage:');
    console.log('  yarn export-newsletter-users [options]');
    console.log('\nOptions:');
    console.log('  --prod              Use production environment (default: development)');
    console.log('  --format <format>   Output format: json or csv (default: csv)');
    console.log('  --output <file>     Output file path (default: auto-generated)');
    console.log('\nExamples:');
    console.log('  yarn export-newsletter-users --prod');
    console.log('  yarn export-newsletter-users --prod --format json');
    console.log('  yarn export-newsletter-users --prod --output newsletter-list.csv');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Process interrupted. Exiting...');
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

export { NewsletterUserExporter };
