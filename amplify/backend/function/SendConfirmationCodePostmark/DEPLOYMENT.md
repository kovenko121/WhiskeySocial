# SendConfirmationCodePostmark Deployment Guide

This Lambda function replaces the SES-based SendConfirmationCode with Postmark for email delivery.

## Prerequisites

1. Postmark account with a verified sender domain
2. Postmark Server API Token
3. AWS SSM Parameter Store or environment variable for API key storage

## Environment Setup

### 1. Store Postmark Server Token

For each environment (dev, staging, prod), store the Postmark Server Token in AWS SSM Parameter Store:

```bash
aws ssm put-parameter \
  --name "/amplify/dev/POSTMARK_SERVER_TOKEN" \
  --value "your-postmark-server-token" \
  --type "SecureString" \
  --overwrite

aws ssm put-parameter \
  --name "/amplify/staging/POSTMARK_SERVER_TOKEN" \
  --value "your-postmark-server-token" \
  --type "SecureString" \
  --overwrite

aws ssm put-parameter \
  --name "/amplify/production/POSTMARK_SERVER_TOKEN" \
  --value "your-postmark-server-token" \
  --type "SecureString" \
  --overwrite
```

### 2. Update GraphQL Schema

Replace the SendConfirmationCode function directive with SendConfirmationCodePostmark:

```graphql
# Before
type Mutation {
  sendConfirmationCode(email: String!, operation: Operation!): Boolean @function(name: "SendConfirmationCode-${env}")
}

# After
type Mutation {
  sendConfirmationCode(email: String!, operation: Operation!): Boolean @function(name: "SendConfirmationCodePostmark-${env}")
}
```

### 3. Deploy the Function

```bash
# Add the function to Amplify
amplify add function
# Choose: Lambda function
# Provide function name: SendConfirmationCodePostmark
# Choose: NodeJS
# Choose: Lambda trigger
# Choose: AppSync - GraphQL

# Or if manually adding, update backend-config.json to include:
{
  "function": {
    "SendConfirmationCodePostmark": {
      "build": true,
      "providerPlugin": "awscloudformation",
      "service": "Lambda"
    }
  }
}

# Deploy to specific environment
amplify push --env dev
amplify push --env staging
amplify push --env prod
```

## Environment-Specific Configuration

The CloudFormation template automatically handles environment naming:
- Development: `SendConfirmationCodePostmark-dev`
- Staging: `SendConfirmationCodePostmark-staging`
- Production: `SendConfirmationCodePostmark-prod`

## Testing

Test the function deployment:

```bash
# Test Lambda directly
aws lambda invoke \
  --function-name SendConfirmationCodePostmark-dev \
  --payload '{"arguments":{"email":"test@example.com","operation":"SIGNUP"}}' \
  response.json

# Test via GraphQL
amplify mock api
```

## Rollback Plan

If issues occur, revert the GraphQL schema to use the original function:

```graphql
type Mutation {
  sendConfirmationCode(email: String!, operation: Operation!): Boolean @function(name: "SendConfirmationCode-${env}")
}
```

Then run `amplify push` to revert.

## Monitoring

Monitor the function in CloudWatch Logs:
- Log group: `/aws/lambda/SendConfirmationCodePostmark-{env}`
- Check for Postmark API errors
- Monitor email delivery rates

## Notes

- The function maintains the same interface as the original SendConfirmationCode
- The test email bypass (taylor+apple@devlandia.net) is preserved
- DynamoDB table naming follows the same pattern: `2fa-whiskeysocial-{env}`
- TTL for confirmation codes remains at 5 minutes (300 seconds)