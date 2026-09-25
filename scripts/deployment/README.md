# Deployment Script Runner

A system for orchestrating deployment scripts via a centralized configuration file.

## Overview

The Deployment Script Runner executes registered scripts from `run-list.json` in order. It provides validation, dry-run capabilities, and detailed logging for deployment operations.

## Commands

```bash
# Validate run-list.json configuration
yarn deploy:validate

# Dry run - shows what would execute without making changes
yarn deploy:scripts:dry-run

# Execute all enabled scripts
yarn deploy:scripts
```

## Configuration

Scripts are registered in `run-list.json`:

```json
{
  "stopOnError": true,
  "scripts": [
    {
      "name": "sync-app-version",
      "path": "./scripts/sync-app-version.ts",
      "description": "Updates app version in database and src/version.json",
      "enabled": true,
      "args": {
        "execute": true
      }
    }
  ]
}
```

### Global Configuration Options

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `stopOnError` | boolean | `false` | Stop execution if a script fails. Set to `true` when later scripts depend on earlier ones. |

### Script Configuration Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique identifier for the script |
| `path` | string | Yes | Path to script file (relative to project root) |
| `description` | string | No | Human-readable description |
| `enabled` | boolean | Yes | Whether to run this script |
| `args` | object | Yes | Arguments passed to the script's `run()` function |

## Adding New Scripts

1. Create your script file with an exported `run()` function:

```typescript
// scripts/my-script.ts

interface MyScriptArgs {
  someOption?: boolean;
  anotherOption?: string;
}

export async function run(args: MyScriptArgs = {}): Promise<void> {
  console.log('Running my script with args:', args);

  // Your script logic here

  if (!args.someOption) {
    // Prompt user or use defaults in interactive mode
  }
}
```

2. Register the script in `run-list.json`:

```json
{
  "scripts": [
    {
      "name": "my-script",
      "path": "./scripts/my-script.ts",
      "description": "Does something useful",
      "enabled": true,
      "args": {
        "someOption": true,
        "anotherOption": "value"
      }
    }
  ]
}
```

3. Validate your configuration:

```bash
yarn deploy:validate
```

## Authentication

Scripts that require AWS authentication use Cognito credentials from environment variables:

```bash
# .env
COGNITO_USERNAME=your-username@example.com
COGNITO_PASSWORD=your-password
```

The shared authentication helper (`helpers/auth.ts`) provides:
- `loadAwsConfig()` - Loads AWS configuration from `aws-exports.js`
- `initializeAmplify()` - Initializes Amplify with auth config
- `authenticate()` - Signs in with Cognito credentials
- `getAuthToken()` - Gets current JWT token
- `getAuthHeaders()` - Gets headers for authenticated GraphQL requests

## Script Interface

Scripts must export a `run()` function that:
- Accepts an `args` object from `run-list.json`
- Returns a `Promise<void>`
- Throws errors on failure (caught by runner)

```typescript
export async function run(args: Record<string, unknown>): Promise<void> {
  // Implementation
}
```

## Execution Flow

1. Runner loads `run-list.json`
2. Validates all script configurations
3. Filters to enabled scripts only
4. Executes each script in order
5. Collects results and prints summary
6. Exits with code 1 if any script failed

## Modes

### Validate Mode (`--validate`)
Checks that:
- All scripts have required fields
- Script files exist at specified paths
- `enabled` field is a boolean

### Dry Run Mode (`--dry-run`)
- Validates configuration
- Shows which scripts would run
- Displays args that would be passed
- Makes no actual changes

### Execute Mode (default)
- Runs all enabled scripts
- Passes configured args to each script
- If `stopOnError` is `true`, stops on first failure; if `false`, continues to next script
- Reports final summary with success/failure counts

## Project Structure

```
scripts/
├── deployment/
│   ├── README.md                  # This file
│   ├── run-list.json              # Script registry
│   ├── run-deployment-scripts.ts  # Main runner
│   └── helpers/
│       ├── auth.ts                # Shared authentication
│       └── logger.ts              # Shared logging utilities
├── sync-app-version.ts            # Example registered script
└── tsconfig.json                  # TypeScript config for scripts
```

## Troubleshooting

### Script not found
Ensure the `path` in `run-list.json` is relative to the project root.

### Authentication errors
1. Check that `COGNITO_USERNAME` and `COGNITO_PASSWORD` are set in `.env`
2. Verify the user exists in the Cognito User Pool
3. Ensure the user is in the Admin group (for write operations)

### Module resolution errors
Scripts use CommonJS via `scripts/tsconfig.json`. If adding new scripts, ensure they don't use ESM-only syntax like `import.meta.url`.
