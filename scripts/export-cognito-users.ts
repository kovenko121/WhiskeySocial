#!/usr/bin/env ts-node

import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface CognitoUser {
  id: string;
  email: string;
  emailVerified: boolean;
  status: string;
  createdAt: Date;
  lastModified: Date;
  username: string;
}

interface ExportConfig {
  userPoolId: string;
  region: string;
  outputFormat: 'json' | 'csv';
  outputFile?: string;
  resetPasswords?: boolean;
  execute?: boolean;
  secretKey?: string;
  userId?: string;
}

class CognitoUserExporter {
  private cognitoClient: AWS.CognitoIdentityServiceProvider;

  private config: ExportConfig;

  private users: CognitoUser[] = [];

  private stats = {
    totalUsers: 0,
    verified: 0,
    unverified: 0,
    deleted: 0,
    eligible: 0,
    updated: 0,
    errors: 0,
  };

  constructor(config: ExportConfig) {
    this.config = config;
    this.cognitoClient = new AWS.CognitoIdentityServiceProvider({
      region: config.region,
    });
  }

  async run(): Promise<void> {
    if (this.config.resetPasswords) {
      const mode = this.config.execute ? '🚀 EXECUTION MODE' : '🔍 DRY RUN MODE';
      console.log('🔧 Cognito Password Reset Tool');
      console.log(`${mode} - ${this.config.execute ? 'REAL changes will be made!' : 'Analysis only'}`);
    } else {
      console.log('🔍 Cognito User Export Tool');
    }
    console.log(`📍 User Pool ID: ${this.config.userPoolId}`);
    console.log(`🌍 Region: ${this.config.region}\n`);

    try {
      // Fetch all users
      await this.fetchAllUsers();

      if (this.config.resetPasswords) {
        // Reset passwords for eligible users
        await this.resetPasswords();
      } else {
        // Export to file
        await this.exportToFile();
      }

      // Show summary
      this.showSummary();
    } catch (error) {
      console.error('❌ Operation failed:', error);
      process.exit(1);
    }
  }

  private async fetchAllUsers(): Promise<void> {
    console.log('📥 Fetching users from Cognito...');

    let paginationToken: string | undefined;
    let totalFetched = 0;

    do {
      const params: AWS.CognitoIdentityServiceProvider.ListUsersRequest = {
        UserPoolId: this.config.userPoolId,
        Limit: 60, // Max allowed by AWS
        PaginationToken: paginationToken,
      };

      try {
        const response = await this.cognitoClient.listUsers(params).promise();

        if (response.Users) {
          for (const user of response.Users) {
            const cognitoUser = this.parseUser(user);
            if (cognitoUser) {
              this.users.push(cognitoUser);
            }
          }

          totalFetched += response.Users.length;
          console.log(`  Fetched ${totalFetched} users so far...`);
        }

        paginationToken = response.PaginationToken;
      } catch (error: any) {
        console.error('❌ Error fetching users:', error.message);
        throw error;
      }
    } while (paginationToken);

    console.log(`✅ Successfully fetched ${this.users.length} users\n`);
  }

  private parseUser(user: AWS.CognitoIdentityServiceProvider.UserType): CognitoUser | null {
    const attributes = user.Attributes || [];

    // Get user ID (sub attribute)
    const subAttr = attributes.find((attr) => attr.Name === 'sub');
    const id = subAttr?.Value || user.Username || 'unknown';

    // Get email
    const emailAttr = attributes.find((attr) => attr.Name === 'email');
    const email = emailAttr?.Value || '';

    // Get email verified status
    const emailVerifiedAttr = attributes.find((attr) => attr.Name === 'email_verified');
    const emailVerified = emailVerifiedAttr?.Value === 'true';

    if (!email) {
      console.warn(`⚠️  User ${id} has no email address, skipping...`);
      return null;
    }

    return {
      id,
      email,
      emailVerified,
      status: user.UserStatus || 'UNKNOWN',
      createdAt: user.UserCreateDate || new Date(),
      lastModified: user.UserLastModifiedDate || new Date(),
      username: user.Username || '',
    };
  }

  private async resetPasswords(): Promise<void> {
    console.log('\n🔄 Processing users for password reset...\n');

    // If userId is specified, find and reset only that user
    if (this.config.userId) {
      const targetUser = this.users.find((user) => user.id === this.config.userId);

      if (!targetUser) {
        console.log(`❌ User with ID ${this.config.userId} not found`);
        return;
      }

      // Check if user is eligible
      if (
        targetUser.status !== 'CONFIRMED' ||
        // targetUser.status === 'EXTERNAL_PROVIDER' ||
        !targetUser.emailVerified ||
        targetUser.username.toLowerCase().includes('_deleted')
      ) {
        console.log(`❌ User ${this.config.userId} is not eligible for password reset:`);
        console.log(`   Status: ${targetUser.status}`);
        console.log(`   Email verified: ${targetUser.emailVerified}`);
        console.log(`   Username: ${targetUser.username}`);
        return;
      }

      console.log(`🎯 Targeting specific user: ${targetUser.email}\n`);
      this.stats.eligible = 1;
      await this.resetUserPassword(targetUser, 1, 1);
      console.log('\n✅ Password reset process complete!\n');
      return;
    }

    // Otherwise, process all eligible users
    const eligibleUsers = this.users.filter(
      (user) =>
        user.status === 'CONFIRMED' &&
        user.emailVerified &&
        !user.username.toLowerCase().includes('_deleted')
    );

    this.stats.eligible = eligibleUsers.length;
    console.log(`📊 Found ${eligibleUsers.length} eligible users (verified emails, not deleted)\n`);

    if (eligibleUsers.length === 0) {
      console.log('No eligible users to process.');
      return;
    }

    for (let i = 0; i < eligibleUsers.length; i++) {
      const user = eligibleUsers[i];
      await this.resetUserPassword(user, i + 1, eligibleUsers.length);

      // Rate limiting - avoid throttling
      await this.delay(100);
    }

    console.log('\n✅ Password reset process complete!\n');
  }

  private async resetUserPassword(user: CognitoUser, index: number, total: number): Promise<void> {
    try {
      const newPassword = this.generatePassword(user.email);

      console.log(`[${index}/${total}] Processing: ${user.email}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  New password: ${newPassword}`);

      if (!this.config.execute) {
        console.log(`  💡 Would reset password (dry run)\n`);
        this.stats.updated++;
        return;
      }

      // Set permanent password for the user
      const params: AWS.CognitoIdentityServiceProvider.AdminSetUserPasswordRequest = {
        UserPoolId: this.config.userPoolId,
        Username: user.username,
        Password: newPassword,
        Permanent: true,
      };

      await this.cognitoClient.adminSetUserPassword(params).promise();
      console.log(`  ✅ Password reset successfully\n`);
      this.stats.updated++;
    } catch (error: any) {
      console.error(`  ❌ Error resetting password for ${user.email}:`, error.message);
      this.stats.errors++;
    }
  }

  private generatePassword(email: string): string {
    const secretKey = this.config.secretKey || '';
    const inputString = `${secretKey} ${email}`;

    // Match the app's defaultPassword function exactly:
    // - Uses SHA512 algorithm
    // - Input format: `${SECRETKEY} ${email}` (space between them)
    // - Returns digest.slice(98) if length > 98

    console.log(`  🔐 Password Generation Debug:`);
    console.log(`     Secret Key: "${secretKey}"`);
    console.log(`     Email: "${email}"`);
    console.log(`     Input String: "${inputString}"`);

    const digest = crypto
      .createHash('sha512')
      .update(inputString)
      .digest('hex');

    console.log(`     Full Digest: ${digest}`);
    console.log(`     Digest Length: ${digest.length}`);

    if (digest.length > 98) {
      const password = digest.slice(98);
      console.log(`     Final Password: ${password}`);
      return password;
    }

    console.log(`     Final Password: ${digest} (full digest)`);
    return digest;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async exportToFile(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const defaultFilename = `cognito-users-${timestamp}.${this.config.outputFormat}`;
    const outputPath = this.config.outputFile || path.join(process.cwd(), defaultFilename);

    console.log(`💾 Exporting to ${outputPath}...`);

    let content: string;

    if (this.config.outputFormat === 'csv') {
      content = this.generateCSV();
    } else {
      content = this.generateJSON();
    }

    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`✅ Export complete: ${outputPath}\n`);
  }

  private generateCSV(): string {
    const headers = ['ID', 'Email', 'Email Verified', 'Status', 'Created At', 'Last Modified'];
    const rows = this.users.map((user) => [
      user.id,
      user.email,
      user.emailVerified ? 'Yes' : 'No',
      user.status,
      user.createdAt.toISOString(),
      user.lastModified.toISOString(),
    ]);

    return [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
  }

  private generateJSON(): string {
    return JSON.stringify(this.users, null, 2);
  }

  private showSummary(): void {
    if (this.config.resetPasswords) {
      console.log('📊 PASSWORD RESET SUMMARY\n');
      console.log(`Total users fetched: ${this.users.length}`);
      console.log(`Eligible users (verified, not deleted): ${this.stats.eligible}`);
      console.log(`Passwords ${this.config.execute ? 'reset' : 'that would be reset'}: ${this.stats.updated}`);
      console.log(`Errors encountered: ${this.stats.errors}`);

      if (this.stats.updated > 0 && !this.config.execute) {
        console.log('\n💡 To apply these changes, run with --execute flag');
      } else if (this.stats.updated > 0 && this.config.execute) {
        console.log('\n✅ Password reset completed successfully!');
        if (this.stats.errors > 0) {
          console.log(`⚠️  ${this.stats.errors} errors occurred during the process`);
        }
      }
    } else {
      console.log('📊 EXPORT SUMMARY\n');
      console.log(`Total users exported: ${this.users.length}`);

      const verified = this.users.filter((u) => u.emailVerified).length;
      const unverified = this.users.length - verified;

      console.log(`Email verified: ${verified}`);
      console.log(`Email unverified: ${unverified}`);

      // Status breakdown
      const statusCounts: Record<string, number> = {};
      this.users.forEach((user) => {
        statusCounts[user.status] = (statusCounts[user.status] || 0) + 1;
      });

      console.log('\nStatus breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }
  }
}

// Load configuration from aws-exports.prod.js
function loadConfig(isProd: boolean): { userPoolId: string; region: string } {
  try {
    const configFile = isProd ? 'aws-exports.prod.js' : 'aws-exports.js';
    const configPath = path.join(__dirname, '..', configFile);

    if (!fs.existsSync(configPath)) {
      throw new Error(
        `${configFile} not found. Please ensure the file exists at ${configPath}`
      );
    }

    const awsConfig = require(configPath);
    const userPoolId = awsConfig.default?.aws_user_pools_id || awsConfig.aws_user_pools_id;
    const region = awsConfig.default?.aws_project_region || awsConfig.aws_project_region;

    if (!userPoolId || !region) {
      throw new Error(
        `Configuration incomplete in ${configFile}. Please ensure it contains:\n` +
          '- aws_user_pools_id\n' +
          '- aws_project_region'
      );
    }

    return { userPoolId, region };
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

  const secretKeyIndex = args.indexOf('--secret-key');
  const secretKey = secretKeyIndex !== -1 && args[secretKeyIndex + 1] ? args[secretKeyIndex + 1] : '';

  const userIdIndex = args.indexOf('--user-id');
  const userId = userIdIndex !== -1 && args[userIdIndex + 1] ? args[userIdIndex + 1] : undefined;

  const isProd = args.includes('--prod');
  const resetPasswords = args.includes('--reset-passwords');
  const execute = args.includes('--execute');

  if (!['json', 'csv'].includes(format)) {
    throw new Error('Invalid format. Use --format json or --format csv');
  }

  return {
    format: format as 'json' | 'csv',
    output,
    isProd,
    resetPasswords,
    execute,
    secretKey,
    userId,
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
      outputFormat: options.format,
      outputFile: options.output,
      resetPasswords: options.resetPasswords,
      execute: options.execute,
      secretKey: options.secretKey,
      userId: options.userId,
    };

    const exporter = new CognitoUserExporter(config);
    await exporter.run();
  } catch (error: any) {
    console.error('\n❌ Script failed:', error.message || error);
    console.log('\nUsage:');
    console.log('  yarn ts-node scripts/export-cognito-users.ts [options]');
    console.log('\nOptions:');
    console.log('  --prod                  Use production Cognito (default: development)');
    console.log('  --format <format>       Output format: json or csv (default: csv)');
    console.log('  --output <file>         Output file path (default: auto-generated)');
    console.log('  --reset-passwords       Reset passwords for verified, non-deleted users');
    console.log('  --execute               Execute changes (use with --reset-passwords)');
    console.log('  --secret-key <key>      Secret key for password hashing (default: empty string)');
    console.log('  --user-id <id>          Reset password for specific user ID only');
    console.log('\nExport Examples:');
    console.log('  yarn ts-node scripts/export-cognito-users.ts --prod --format csv');
    console.log('  yarn ts-node scripts/export-cognito-users.ts --prod --format json --output users.json');
    console.log('\nPassword Reset Examples:');
    console.log('  # Dry run all users (preview changes)');
    console.log('  yarn ts-node scripts/export-cognito-users.ts --prod --reset-passwords');
    console.log('');
    console.log('  # Reset all users with default secret key');
    console.log('  yarn ts-node scripts/export-cognito-users.ts --prod --reset-passwords --execute');
    console.log('');
    console.log('  # Reset specific user by ID');
    console.log('  yarn ts-node scripts/export-cognito-users.ts --prod --reset-passwords --execute --user-id "abc-123-xyz"');
    console.log('');
    console.log('  # Reset with custom secret key');
    console.log('  yarn ts-node scripts/export-cognito-users.ts --prod --reset-passwords --execute --secret-key "my-secret"');
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

export { CognitoUserExporter };
