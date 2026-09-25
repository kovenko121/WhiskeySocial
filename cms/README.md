# Whiskey Social CMS

Content Management System for the Whiskey Social application built with modern web technologies.

## Tech Stack

### Core Framework
- **[Next.js](https://nextjs.org/docs)** - React framework for production with SSR/SSG support
- **[React](https://react.dev/learn)** - UI library for building user interfaces
- **[TypeScript](https://www.typescriptlang.org/docs/)** - Type-safe JavaScript

### Admin Framework
- **[Refine](https://refine.dev/docs/)** - React-based framework for building admin panels and internal tools
  - Provides CRUD operations, authentication, routing, and form management out of the box
  - Integrates seamlessly with GraphQL APIs

### Authentication & Authorization
- **[NextAuth.js](https://next-auth.js.org/getting-started/introduction)** - Complete authentication solution for Next.js
- **[AWS Cognito](https://docs.aws.amazon.com/cognito/)** - Identity management service
- **OIDC (OpenID Connect)** - Authentication protocol for secure user verification

### Data Layer
- **[GraphQL](https://graphql.org/learn/)** - Query language and runtime for APIs
- **[graphql-request](https://github.com/jasonkuhrt/graphql-request#readme)** - Minimal GraphQL client
- **[AWS AppSync](https://docs.aws.amazon.com/appsync/)** - Managed GraphQL service

### UI Components
- **[Ant Design](https://ant.design/docs/react/introduce)** - Enterprise-class UI design language and components
- **[Ant Design Icons](https://ant.design/components/icon)** - Icon components based on Ant Design

### Internationalization
- **[next-i18next](https://github.com/i18next/next-i18next#readme)** - Internationalization framework for Next.js

### Development Tools
- **[ESLint](https://eslint.org/docs/latest/)** - JavaScript linter for code quality
- **[Prettier](https://prettier.io/docs/)** - Code formatter

## How Refine Works

### Page Structure
Refine follows a resource-based approach where each entity (like `whiskey`, `venue`, `CMSUser`) becomes a resource with standard CRUD pages:

```
cms/pages/
├── whiskey/
│   ├── index.tsx      # List view
│   ├── create/
│   │   └── index.tsx  # Create form
│   ├── edit/
│   │   └── [id].tsx   # Edit form
│   └── show/
│       └── [id].tsx   # Detail view
└── venue/
    ├── index.tsx      # List view
    └── create/
        └── index.tsx  # Create form
```

### Data Provider Integration
Refine uses a custom GraphQL data provider (`cms/src/graphql-data-provider/`) that:

1. **Automatically generates mutations** for standard CRUD operations:
   ```typescript
   // For resource "whiskey", generates:
   // mutation Create($input: CreateWhiskeyInput!) {
   //   createWhiskey(input: $input) { id }
   // }
   ```

2. **Maps resources to GraphQL operations**:
   - `list` → `listWhiskeys(limit: 2000) { items { ... } }`
   - `create` → `createWhiskey(input: $input) { id }`
   - `update` → `updateWhiskey(input: $input) { ... }`
   - `getOne` → `getWhiskey(id: $id) { ... }`

3. **Handles custom mutations** via the `custom` method for non-standard operations

### Standard vs Custom Mutations

#### Standard CRUD (e.g., Venue Creation)
```typescript
// Uses Refine's useForm hook
const { formProps, saveButtonProps } = useForm({
  redirect: 'show'
});

// Automatically calls data provider's create() method
// which generates: createVenue(input: CreateVenueInput!)
```

#### Custom Business Logic (e.g., CMS User Creation)
```typescript
// Uses custom mutation with useCustomMutation
const { mutate } = useCustomMutation();

const createCMSUserMutation = `
  mutation CreateCMSUserWithAuth($email: String!, $role: CMSUserRole!, $brandId: String) {
    createCMSUserWithAuth(email: $email, role: $role, brandId: $brandId) {
      statusCode
      success
      message
    }
  }
`;

// Manual mutation call
mutate({
  meta: {
    query: createCMSUserMutation,
    queryName: 'createCMSUserWithAuth',
    variables: { email, role, brandId }
  }
});
```

### Authentication Flow
1. NextAuth handles login/logout with AWS Cognito
2. OIDC tokens are attached to GraphQL requests
3. AWS AppSync validates tokens and applies authorization rules
4. Lambda functions receive authenticated context for business logic

### Resource Configuration
Resources are defined in `_app.tsx` with role-based access:

```typescript
const adminResources = [
  {
    name: 'whiskey',
    list: '/whiskey',
    create: '/whiskey/create',
    edit: '/whiskey/edit/:id',
    show: '/whiskey/show/:id',
    meta: { canDelete: false }
  }
];
```

This configuration automatically:
- Generates navigation menus
- Sets up routing
- Provides CRUD capabilities
- Applies permissions based on user role

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables (copy from `.env.example`)
3. Run development server: `npm run dev`
4. Access CMS at `http://localhost:3000`

## Architecture Notes

- **Token Management**: Automatic refresh and expiration handling
- **File Uploads**: S3 integration for images and documents  
- **Form Validation**: Built-in validation with Ant Design forms
- **Internationalization**: Multi-language support via i18next
- **Type Safety**: Full TypeScript coverage for API responses and forms