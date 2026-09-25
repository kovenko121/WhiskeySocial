<img width="100%" src="./assets/images/header.png">

This is the Whiskey Social App, powered by React Native and Amplify.

### Stack

| Links                                            |
| ------------------------------------------------ |
| [React Native](https://reactnative.dev/)         |
| [Expo](https://expo.dev/)                        |
| [React Navigation](https://reactnavigation.org/) |
| [Amplify](https://docs.amplify.aws/)             |

| Useful links                                                                              |
| ----------------------------------------------------------------------------------------- |
| [Amplify Studio](https://us-east-2.admin.amplifyapp.com/admin/login?appId=dkyqswjkpq99s)  |
| [CMS (Dev)](https://main.d1qp1ad0zi25cp.amplifyapp.com)                                   |
| [CMS (Prod)](https://cms-prod.d1qp1ad0zi25cp.amplifyapp.com)                              |
| [AppStore Connect](https://appstoreconnect.apple.com/)                                    |
| [Expo App](https://expo.dev/accounts/whiskey-social/projects/whiskey-social)               |

## Code structure

We are going to follow a basic domain driven design, taking full advantage of code colocation.

```sh
/src
├─ contexts/            # Reusable contexts
├─ components/          # Reusable components
│  ├─ index.ts          # Barrel export components
├─ domains/             # Think in domains mostly as screens
│  ├─ Auth/             # The auth domain that will hold all screens related to authentication
│  │  ├─ components/    # Auth related components
│  │  ├─ hooks/         # Auth related hooks
│  │  ├─ Login/         # The Login screen
│  │  │  ├─ components/ # Login related components
│  │  │  ├─ hooks/      # Login related hooks
│  │  │  ├─ Login.tsx   # Login screen component
│  ├─ index.ts          # Barrel export domains
├─ hooks/               # Reusable hooks
├─ types/               # Reusable types
├─ routes/              # Routes
├─ helpers/             # Helpers, like formatters, validators, etc
├─ services/            # External services, like API, Storage, etc
├─ styles/              # Reusable styles, like themes, colors, etc
├─ graphql/             # Auto generated types
```

## Analytics

Screens are reported to PostHog under stable names that are deliberately decoupled from
navigation route names, so renaming or moving a route never breaks a trend line. The name
list, the rule for changing it, and what `source_screen` means on each event are in
[Docs/ANALYTICS_SCREEN_NAMES.md](./Docs/ANALYTICS_SCREEN_NAMES.md). Read that before
renaming a route.

## CI/CD

We are going to use [GitHub Actions](https://docs.github.com/en/actions) to automate our CI/CD pipeline.

### Actions when a PR is opened:

- CI Lint: Run lint it should have zero errors.
- CD Deploy DEV: Deploy the backend to dev environment (it only triggers if you made changes on the backend).

### Actions when a PR is merged:

- CD Build iOS DEV: Build in dev environment the app and send it to TestFlight.
- CD Deploy DEV: Deploy the backend to dev environment (it only triggers if you made changes on the backend).

## Actions when a release is created:

- CD Build iOS PROD: Build in prod environment the app and send it to TestFlight.
- CD Deploy PROD: Deploy the backend to prod environment

### Actions to manually trigger:

- CD Build iOS QA: Build in qa environment the app and send it to TestFlight.

# Get Started

## Install dependencies

```
yarn install
```

## Add environment variables

Please add the environment variables to your .env file and add a `aws-exports.js` file to the root of the project with the amplify variables.

## Run the app

```
yarn start
```

## To run outside of expo go
```
yarn run ios
```

## Run tests

```
yarn test
```

## Run lint

```
yarn lint
```

## Run lint fix

```
yarn lint:fix
```

## How create a Build

We are going to use [Expo](https://expo.dev/) to build the app.

### Build

You can build and submit the app using the Expo CLI.

```
EXPO_NO_CAPABILITY_SYNC=1 eas build --platform=ios --profile staging --auto-submit
```

To build to production, you can use the `--profile production` flag.

### Build locally

You can build the app locally using the Expo CLI.

```
EXPO_NO_CAPABILITY_SYNC=1 eas build --platform=ios --profile staging --local
```

To build to production, you can use the `--profile production` flag.

### OTA Update

You can update the app using the Expo CLI.

```
eas update --channel=staging --auto
```

To update to production, you can use the `--channel=production` flag.

# Backend

This is the Whiskey Social App backend, powered by Amplify, AppSync, DynamoDB, Cognito, S3 and more.
We had there environments: dev, qa and prod.

## Install Amplify CLI

```
npm install -g @aws-amplify/cli
```

## Download the latest's changes on backend

```
amplify pull --appId dkyqswjkpq99s --envName dev
```

## Run a local server

```
amplify mock
```

## Change the environment

```
amplify env checkout {dev | qa | prod}
```

## Upload new changes to backend

> ⚠️ **Do not run `amplify push`.** It is broken on this project and will regress the live schema. See "Why not `amplify push`" below.

### Schema / resolver changes (the 95% case)

Use the local deploy script:

```bash
./scripts/deploy-backend.sh dev
```

It compiles your schema with `amplify api gql-compile`, uploads the artifacts to S3 with a content hash, and updates the `apiwhiskeysocial` CloudFormation nested stack directly. Typically 1–5 minutes.

Useful flags:
- `--dry-run` — compile + upload, but skip the deploy. Prints the hash so you can review.
- `--hash <hash>` — deploy a previously-uploaded hash. **Your rollback button** — save the hash from successful deploys.

After deploying, verify a field is live:

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: <api-key-from-aws-exports.js>" \
  -d '{"query":"{ listUsers(limit:1) { items { id <your-new-field> } } }"}' \
  https://vxlixvxebza6harw6vj5zygkbq.appsync-api.us-east-2.amazonaws.com/graphql
```

A `null` value means the field exists; a `FieldUndefined` error means the deploy didn't reach AppSync.

The script defaults to AWS profile `lawrence-amplify-dev`. Override with `AWS_PROFILE=<your-profile> ./scripts/deploy-backend.sh dev`.

### Lambda code / Cognito / S3 / Pinpoint changes

The script above only handles schema and resolvers. For Lambda function code changes, or anything outside the GraphQL API category (auth, storage, analytics), fall back to category-specific amplify commands (e.g. `amplify function push <name>`) or manual CloudFormation updates. **Do not run a full `amplify push`** — see below.

### Why not `amplify push`

Three independent Amplify CLI bugs combine on this project to make full `amplify push` unsafe:

1. **Root template strips parameters.** The generated root CloudFormation template drops `s3Key` / `deploymentBucketName` from ~40 of the 46 function nested stacks, causing CloudFormation to reject the update with `Parameters: [...] must have values` and roll back.
2. **Iterative deploy gets stuck.** When the schema change adds a new GSI (e.g. anything using `@hasMany` with a new index), Amplify splits the deploy into iterative steps. Step 0 applies an intermediate state that **removes the new fields temporarily**, then step 1 is supposed to add them back along with the GSI. If anything fails between step 0 and step 1 (which it does on this project), the API is left in the intermediate state — the live schema **loses the new fields** until you intervene. `deployment-state.json` in the S3 deployment bucket signals this state.
3. **Lambda packaging hangs.** The `yarn install` step occasionally hangs on a corrupted `@types/aws-lambda` cache entry.

The deploy script above sidesteps all three by using `amplify api gql-compile` (which only compiles, never deploys) and triggering CloudFormation directly with explicit `UsePreviousValue=true` for unchanged parameters.

### Recovery if `amplify push` was run by accident

If someone ran `amplify push` and the live schema regressed (missing fields error in the mobile app):

1. Check `s3://amplify-whiskeysocial-dev-111547-deployment/deployment-state.json` — if it exists and says `status: DEPLOYING`, the iterative deploy is stuck.
2. Find the hash referenced in `previousMetaKey`, then check whether `amplify-appsync-files/<hash>/schema.graphql` (top-level, not `states/01/`) has your fields.
3. Run `./scripts/deploy-backend.sh dev --hash <hash>` to apply that hash's final state, OR re-run `./scripts/deploy-backend.sh dev` to push the latest local source.
4. Delete `deployment-state.json` from S3 to clear the stale lock.

## How to run Maestro tests

To run Maestro tests, follow these steps:

1. Navigate to the `maestro/` folder in your project.
2. Execute the following command (with e-mail and providers that doesn't have vinculated users - or already deleted):

```
maestro test main.yaml -e GOOGLE_EMAIL=YOUR_EMAIL -e GOOGLE_PASSWORD=YOUR_GOOGLE_PASSWORD -e APPLE_PASSWORD=YOUR_APPLE_PASSWORD -e FULL_FLOW=true -e RECORD_MODE=all
```

- `RECORD_MODE` can be set to `all` to record all flows or `each` to record each test in a separate file.
- If you want to run a specific file only, you can omit `FULL_FLOW`, and only the specified file name before the `maestro test` command will be executed.
