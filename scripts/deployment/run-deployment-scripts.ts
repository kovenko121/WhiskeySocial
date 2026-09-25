#!/usr/bin/env ts-node

/**
 * Deployment Script Runner
 *
 * Orchestrates the execution of deployment scripts registered in run-list.json.
 *
 * Usage:
 *   yarn deploy:scripts          - Run all enabled scripts
 *   yarn deploy:scripts:dry-run  - Validate and show what would run
 *   yarn deploy:validate         - Validate run-list.json configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from './helpers/logger';

interface ScriptConfig {
  name: string;
  path: string;
  description?: string;
  enabled: boolean;
  args: Record<string, unknown>;
}

interface RunListConfig {
  scripts: ScriptConfig[];
  stopOnError?: boolean;
}

interface ScriptResult {
  name: string;
  success: boolean;
  error?: string;
  duration: number;
}

class DeploymentRunner {
  private runListPath: string;

  private projectRoot: string;

  private isDryRun: boolean;

  private isValidateOnly: boolean;

  private results: ScriptResult[] = [];

  constructor(options: { dryRun?: boolean; validateOnly?: boolean } = {}) {
    this.projectRoot = path.join(__dirname, '..', '..');
    this.runListPath = path.join(__dirname, 'run-list.json');
    this.isDryRun = options.dryRun ?? false;
    this.isValidateOnly = options.validateOnly ?? false;
  }

  private loadRunList(): RunListConfig {
    if (!fs.existsSync(this.runListPath)) {
      throw new Error(`run-list.json not found at ${this.runListPath}`);
    }

    try {
      const content = fs.readFileSync(this.runListPath, 'utf8');
      const parsed = JSON.parse(content);

      // Runtime validation
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('run-list.json must be an object');
      }
      if (!Array.isArray(parsed.scripts)) {
        throw new Error('run-list.json must have a "scripts" array');
      }

      return parsed as RunListConfig;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse run-list.json: Invalid JSON syntax`);
      }
      throw error;
    }
  }

  private validateScripts(scripts: ScriptConfig[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const seenNames = new Set<string>();

    for (const script of scripts) {
      // Check required fields
      if (!script.name) {
        errors.push(`Script missing required 'name' field`);
        continue;
      }

      // Check for duplicate names
      if (seenNames.has(script.name)) {
        errors.push(`Duplicate script name: '${script.name}'`);
      }
      seenNames.add(script.name);

      if (!script.path) {
        errors.push(`Script '${script.name}' missing required 'path' field`);
        continue;
      }

      // Check if script file exists
      const scriptPath = path.resolve(this.projectRoot, script.path);
      if (!fs.existsSync(scriptPath)) {
        errors.push(`Script '${script.name}' file not found: ${script.path}`);
      }

      // Check enabled is boolean
      if (typeof script.enabled !== 'boolean') {
        errors.push(`Script '${script.name}' has invalid 'enabled' value (must be boolean)`);
      }

      // Check args exists and is an object
      if (script.args === undefined || script.args === null) {
        errors.push(`Script '${script.name}' missing required 'args' field`);
      } else if (typeof script.args !== 'object' || Array.isArray(script.args)) {
        errors.push(`Script '${script.name}' has invalid 'args' value (must be an object)`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private async runScript(script: ScriptConfig): Promise<ScriptResult> {
    const startTime = Date.now();
    logger.setScriptName(script.name);

    try {
      logger.info(`Starting script: ${script.description || script.name}`);

      if (this.isDryRun) {
        logger.info('DRY RUN - Script would execute with args:', script.args);
        return {
          name: script.name,
          success: true,
          duration: Date.now() - startTime,
        };
      }

      // Resolve script path relative to project root
      const scriptPath = path.resolve(this.projectRoot, script.path);

      // Dynamic import of the script
      const scriptModule = await import(scriptPath);

      // Check if script exports a run function
      if (typeof scriptModule.run !== 'function') {
        throw new Error(`Script '${script.name}' does not export a 'run' function`);
      }

      // Execute the script's run function with args
      await scriptModule.run(script.args);

      logger.success(`Script completed successfully`);

      return {
        name: script.name,
        success: true,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Script failed: ${errorMessage}`);

      return {
        name: script.name,
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
      };
    }
  }

  async run(): Promise<void> {
    console.log(`\n${  '='.repeat(60)}`);
    console.log('🚀 DEPLOYMENT SCRIPT RUNNER');
    console.log(`${'='.repeat(60)  }\n`);

    if (this.isDryRun) {
      console.log('📋 MODE: DRY RUN (no changes will be made)\n');
    } else if (this.isValidateOnly) {
      console.log('📋 MODE: VALIDATE ONLY\n');
    } else {
      console.log('📋 MODE: EXECUTE\n');
    }

    try {
      // Load run-list.json
      logger.setScriptName('runner');
      logger.info('Loading run-list.json...');
      const runList = this.loadRunList();

      // Validate all scripts
      logger.info('Validating script configurations...');
      const validation = this.validateScripts(runList.scripts);

      if (!validation.valid) {
        logger.error('Validation failed:');
        validation.errors.forEach((err) => console.log(`  - ${err}`));
        process.exit(1);
      }

      logger.success('All scripts validated successfully');

      // Filter enabled scripts
      const enabledScripts = runList.scripts.filter((s) => s.enabled);

      if (enabledScripts.length === 0) {
        logger.warn('No enabled scripts found in run-list.json');
        return;
      }

      logger.info(`Found ${enabledScripts.length} enabled script(s):`);
      enabledScripts.forEach((s) => {
        console.log(`  - ${s.name}: ${s.description || '(no description)'}`);
      });

      // If validate only, stop here
      if (this.isValidateOnly) {
        console.log('\n✅ Validation complete. All scripts are properly configured.\n');
        return;
      }

      console.log(`\n${  '-'.repeat(60)  }\n`);

      // Run each enabled script in order
      const stopOnError = runList.stopOnError ?? false;
      for (const script of enabledScripts) {
        console.log(`\n${'─'.repeat(40)}`);
        const result = await this.runScript(script);
        this.results.push(result);
        console.log(`${'─'.repeat(40)}\n`);

        // Stop execution if script failed and stopOnError is enabled
        if (!result.success && stopOnError) {
          logger.error('Stopping execution due to script failure (stopOnError is enabled)');
          break;
        }
      }

      // Print summary
      this.printSummary();
    } catch (error) {
      logger.error('Runner failed:', error);
      process.exit(1);
    }
  }

  private printSummary(): void {
    const successCount = this.results.filter((r) => r.success).length;
    const failedCount = this.results.filter((r) => !r.success).length;

    logger.printSummary({
      total: this.results.length,
      success: successCount,
      failed: failedCount,
    });

    // Print detailed results
    if (this.results.length > 0) {
      console.log('\nDetailed Results:');
      this.results.forEach((result) => {
        const status = result.success ? '✅' : '❌';
        const duration = `(${result.duration}ms)`;
        console.log(`  ${status} ${result.name} ${duration}`);
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
      });
    }

    // Exit with error code if any script failed
    if (failedCount > 0) {
      process.exit(1);
    }
  }
}

// Parse command line arguments
function parseArgs(): { dryRun: boolean; validateOnly: boolean } {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    validateOnly: args.includes('--validate') || args.includes('-v'),
  };
}

// Main execution
async function main(): Promise<void> {
  const options = parseArgs();
  const runner = new DeploymentRunner(options);
  await runner.run();
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

// Run if this is the main module
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { DeploymentRunner };
