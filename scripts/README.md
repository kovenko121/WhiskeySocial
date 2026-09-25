# Brand Migration Scripts

Scripts to migrate whiskey brand strings to Brand users.

## Authentication

This script requires Cognito authentication. Provide credentials via:

### Environment Variables
```bash
export COGNITO_USERNAME="your-username"
export COGNITO_PASSWORD="your-password"
```

### Command Line Flags
```bash
yarn migrate-brands --username your-username --password your-password
```

## Usage

1. **Dry run first**: `yarn migrate-brands`
2. **Run migration**: `yarn migrate-brands:execute`

Or with credentials:
```bash
yarn migrate-brands --username admin --password secret
yarn migrate-brands:execute --username admin --password secret
```

## Process

- Creates Brand users from unique whiskey brand names
- Updates whiskeys to reference Brand users via `brandId`
- Preserves existing Brand users
- Includes rate limiting and error handling
- Uses GraphQL client with authentication (similar to syncLikesCount)