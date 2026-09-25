# ReviewRatingUpdater Lambda Function

## Overview

This Lambda function automatically updates whiskey `calculatedRating` values in real-time whenever reviews are created, updated, or deleted. It is triggered by DynamoDB Streams on the Review table.

## How It Works

1. **Trigger**: DynamoDB Stream events from the Review table (INSERT, MODIFY, REMOVE operations)
2. **Processing**:
   - Extracts the `whiskeyId` from each stream record
   - Fetches all reviews for the affected whiskey
   - Calculates the average rating with proper validation
   - Updates the whiskey's `calculatedRating` field
3. **Error Handling**:
   - Skips reviews with null, undefined, or invalid ratings
   - Validates ratings are within 0-5 range
   - Continues processing even if one whiskey update fails
   - Comprehensive logging for debugging

## Key Features

### Rating Calculation
- **Precision**: Ratings are rounded to 1 decimal place using `parseFloat()`
- **Validation**: Reviews without valid ratings are excluded from calculation
- **Null Handling**: If no valid reviews exist, `calculatedRating` is set to `null`

### Value Checking
The function performs extensive validation:
- Checks if rating exists (not null/undefined)
- Validates rating is a number (not NaN)
- Ensures rating is within valid range (0-5)
- Logs skipped reviews for debugging

### Batch Processing
- Processes multiple stream records in a single invocation
- Deduplicates whiskey IDs to avoid redundant updates
- Processes all whiskeys in parallel for better performance

## Architecture

```
Review Table (DynamoDB)
    │
    ├─── DynamoDB Stream (enabled)
    │
    └─── Lambda Trigger (batch size: 100)
         │
         └─── ReviewRatingUpdater Lambda
              │
              ├─── Extract whiskeyIds from stream records
              ├─── Query all reviews for each whiskey
              ├─── Calculate average rating (with validation)
              └─── Update Whiskey table
```

## Environment Variables

Set automatically by Amplify CloudFormation:
- `API_WHISKEYSOCIAL_REVIEWTABLE_NAME`: Review table name
- `API_WHISKEYSOCIAL_WHISKEYTABLE_NAME`: Whiskey table name
- `API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT`: GraphQL API ID
- `ENV`: Environment name (dev, staging, prod)
- `REGION`: AWS region

## IAM Permissions

The Lambda has the following permissions:
- **Review Table**: Read access (Query, Scan, GetItem)
- **Whiskey Table**: Read and Update access
- **DynamoDB Streams**: Read stream records
- **CloudWatch Logs**: Write logs

## Testing

### Local Testing
You can test the Lambda function logic locally using the test event:

```bash
cd amplify/backend/function/ReviewRatingUpdater/src
node -e "const handler = require('./index').handler; const event = require('./test-event.json'); handler(event).then(console.log).catch(console.error);"
```

### Testing in AWS Console

1. Go to AWS Lambda Console
2. Find the `ReviewRatingUpdater-{env}` function
3. Create a test event using the `test-event.json` as template
4. Click "Test" to execute

### Manual Trigger via CLI

```bash
aws lambda invoke \
  --function-name ReviewRatingUpdater-dev \
  --payload file://test-event.json \
  --region us-east-1 \
  response.json

cat response.json
```

## Monitoring

### CloudWatch Logs

All logs are sent to CloudWatch Logs:
- Log group: `/aws/lambda/ReviewRatingUpdater-{env}`
- Search for errors: Filter pattern `ERROR`
- Search for specific whiskey: Filter pattern `whiskey-id`

### Key Log Messages

- `Processing whiskey: {id}` - Starting to process a whiskey
- `Found X reviews for whiskey: {id}` - Number of reviews fetched
- `Review {id} has null/undefined rating, skipping` - Invalid review excluded
- `Calculated rating: X from Y valid reviews` - Final calculated value
- `Successfully updated whiskey {id}` - Update completed
- `Failed to process whiskey {id}` - Error occurred

### Metrics to Monitor

- **Invocations**: How many times the Lambda is triggered
- **Duration**: Average execution time (should be < 5 seconds)
- **Errors**: Failed invocations (should be 0)
- **Throttles**: If the Lambda is rate-limited (should be 0)

## Common Scenarios

### Scenario 1: User Creates a Review
```
1. User submits review with rating = 4.5
2. Review is saved to DynamoDB
3. DynamoDB Stream emits INSERT event
4. Lambda is triggered with the new review
5. Lambda fetches all reviews for that whiskey
6. Lambda calculates average (e.g., 4.3)
7. Whiskey's calculatedRating is updated to 4.3
8. Frontend refetches whiskey data and shows new rating
```

### Scenario 2: User Deletes a Review
```
1. Review is deleted from DynamoDB
2. DynamoDB Stream emits REMOVE event
3. Lambda is triggered
4. Lambda fetches remaining reviews for whiskey
5. Lambda recalculates average without deleted review
6. Whiskey's calculatedRating is updated
```

### Scenario 3: Review Has No Rating (Edge Case)
```
1. Review exists but rating field is null
2. Lambda fetches all reviews including this one
3. Lambda filters out reviews with null ratings
4. Average is calculated only from valid reviews
5. The review with null rating is logged and skipped
```

## Deployment

### Deploy with Amplify

```bash
# Push the new function to AWS
amplify push

# Check deployment status
amplify status
```

### Manual Deployment (if needed)

```bash
# Package the Lambda
cd amplify/backend/function/ReviewRatingUpdater/src
zip -r ../ReviewRatingUpdater.zip .

# Upload via AWS CLI
aws lambda update-function-code \
  --function-name ReviewRatingUpdater-dev \
  --zip-file fileb://../ReviewRatingUpdater.zip
```

## Troubleshooting

### Lambda Not Triggering

**Problem**: Reviews are created but ratings don't update

**Solutions**:
1. Check if DynamoDB Streams is enabled on Review table
2. Verify EventSourceMapping exists and is enabled
3. Check CloudWatch Logs for errors
4. Verify IAM permissions are correct

### Incorrect Ratings

**Problem**: Calculated ratings don't match expected values

**Solutions**:
1. Check CloudWatch Logs for which reviews are being included/excluded
2. Verify reviews have valid `rating` field
3. Check if reviews are being filtered due to validation rules
4. Manually query Review table to verify data

### Timeouts

**Problem**: Lambda times out before completing

**Solutions**:
1. Increase timeout in CloudFormation template (currently 25 seconds)
2. Check if there are too many reviews for a single whiskey
3. Optimize query performance (ensure GSI exists on Review table)

### Permission Errors

**Problem**: Lambda fails with Access Denied errors

**Solutions**:
1. Verify IAM policy includes correct table ARNs
2. Check if tables exist in the correct region
3. Ensure environment variables are set correctly

## Performance Considerations

- **Batch Size**: Set to 100 records per invocation (configurable in CloudFormation)
- **Parallel Processing**: Whiskeys are processed in parallel using `Promise.all()`
- **Stream Deduplication**: Multiple events for same whiskey are deduplicated
- **Query Efficiency**: Uses GSI on Review table for fast whiskey-based queries

## Future Enhancements

Potential improvements:
1. Add caching layer (Redis/ElastiCache) for frequently accessed whiskeys
2. Implement exponential backoff for failed updates
3. Add SNS notification for persistent failures
4. Create CloudWatch Dashboard with key metrics
5. Add Dead Letter Queue (DLQ) for failed records

## Related Files

- **Lambda Function**: `src/index.js`
- **CloudFormation Template**: `ReviewRatingUpdater-cloudformation-template.json`
- **Test Event**: `src/test-event.json`
- **Backend Config**: `amplify/backend/backend-config.json`

## Support

For issues or questions:
1. Check CloudWatch Logs for error messages
2. Review this README for troubleshooting tips
3. Check the [fix-whiskey-star-ratings](../../../features/fix-whiskey-star-ratings/) ticket for context
