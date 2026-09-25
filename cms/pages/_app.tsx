import { Header } from '@components/header';
import {
  ColorModeContextProvider,
  PermissionContext,
  PermissionContextProvider,
} from '@contexts';
import {
  ThemedLayoutV2,
  ThemedSiderV2,
  ThemedTitleV2,
  useNotificationProvider,
} from '@refinedev/antd';
import '@refinedev/antd/dist/reset.css';
import { AuthBindings, Refine } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import routerProvider, {
  UnsavedChangesNotifier,
} from '@refinedev/nextjs-router';
import * as Sentry from '@sentry/nextjs';
import { App as AntdApp } from 'antd';
import { GraphQLClient } from 'graphql-request';
import type { NextPage } from 'next';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import { appWithTranslation, useTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import { AppIcon } from '../src/components/app-icon';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { dataProvider } from '../src/graphql-data-provider';
import { CMSUserRole } from '../src/graphql-data-provider/utils/graphQlTypes';

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,

    // Distinguish between mobile app and CMS
    environment: process.env.NODE_ENV || 'development',

    // Enabled in all environments including development
    // To disable in dev, add: enabled: process.env.NODE_ENV === 'production',
    enabled: true,

    // Add tags to identify this is the CMS
    initialScope: {
      tags: {
        platform: 'cms',
        app: 'whiskey-social-cms',
      },
    },

    // Adds more context data to events
    sendDefaultPii: false,

    // Enable Logs
    enableLogs: true,

    // Adjust the sample rate for performance monitoring
    tracesSampleRate: 1.0,

    // Replay settings
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Add beforeSend hook to scrub sensitive data
    beforeSend(event, hint) {
      // List of sensitive keys to remove (case-insensitive matching)
      const sensitivePatterns = [
        /password/i,
        /passwd/i,
        /pwd/i,
        /token/i,
        /accesstoken/i,
        /refreshtoken/i,
        /idtoken/i,
        /authorization/i,
        /auth/i,
        /bearer/i,
        /cookie/i,
        /session/i,
        /secret/i,
        /apikey/i,
        /api_key/i,
        /private.?key/i,
        /secret.?key/i,
        /ssn/i,
        /credit_card/i,
        /cvv/i,
      ];

      /**
       * Recursively traverses an object and redacts any values whose keys match
       * sensitive patterns (e.g., passwords, tokens, API keys).
       *
       * How it works:
       * 1. Base case: If the input is null/undefined or not an object, return it unchanged
       * 2. Circular reference check: Use WeakSet to detect and skip circular references
       * 3. Array case: Map over each element and recursively scrub it
       * 4. Object case: Iterate through each key-value pair:
       *    - If the key matches a sensitive pattern, replace the value with '[REDACTED]'
       *    - If the value is a nested object/array, recursively scrub it
       *    - Otherwise, keep the value unchanged
       */
      const seen = new WeakSet();
      const scrubObject = (obj: any): any => {
        // Base case: primitives and nullish values pass through unchanged
        if (!obj || typeof obj !== 'object') return obj;

        // Circular reference check: skip objects we've already visited
        if (seen.has(obj)) {
          return '[Circular Reference]';
        }
        seen.add(obj);

        // Array case: recursively scrub each element
        if (Array.isArray(obj)) {
          return obj.map(scrubObject);
        }

        // Object case: build a new object with scrubbed values
        const scrubbed: any = {};
        for (const [key, value] of Object.entries(obj)) {
          // Check if this key matches any sensitive pattern (case-insensitive)
          const isSensitive = sensitivePatterns.some((pattern) =>
            pattern.test(key)
          );

          if (isSensitive) {
            // Sensitive key found - redact the value
            scrubbed[key] = '[REDACTED]';
          } else if (value && typeof value === 'object') {
            // Non-sensitive key with nested object - recurse deeper
            scrubbed[key] = scrubObject(value);
          } else {
            // Non-sensitive primitive value - keep as-is
            scrubbed[key] = value;
          }
        }
        return scrubbed;
      };

      // Scrub request data
      if (event.request) {
        if (event.request.headers) {
          event.request.headers = scrubObject(event.request.headers);
        }
        if (event.request.data) {
          event.request.data = scrubObject(event.request.data);
        }
        if (event.request.cookies) {
          event.request.cookies = scrubObject(event.request.cookies);
        }
      }

      // Scrub contexts
      if (event.contexts) {
        event.contexts = scrubObject(event.contexts);
      }

      // Scrub extra data
      if (event.extra) {
        event.extra = scrubObject(event.extra);
      }

      return event;
    },
  });
}

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  noLayout?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App = ({ children }: React.PropsWithChildren) => {
  const { t, i18n } = useTranslation();
  const { data, status } = useSession();
  const router = useRouter();
  const { to } = router.query;
  const { role, hasNoBrandsAssigned } = useContext(PermissionContext);

  // Track user in Sentry when session changes
  useEffect(() => {
    if (data?.user) {
      const email = data.user.email ?? undefined;
      const username = data.user.name ?? undefined;
      Sentry.setUser({
        // Only set an ID when we have a stable identifier; otherwise omit it
        ...(email ? { id: email } : {}),
        email,
        username,
      });
    } else {
      // Clear user context on logout
      Sentry.setUser(null);
    }
  }, [data?.user]);

  // Handle session errors and token expiration
  useEffect(() => {
    // Only check for refresh errors - NextAuth will handle refresh automatically
    if (data?.error === 'RefreshAccessTokenError') {
      signOut({ redirect: true, callbackUrl: '/login' });
    }
  }, [data?.error]);

  const graphqlClient = new GraphQLClient(`${process.env.API_URL}`, {
    headers: {
      authorization: data?.idToken || '', // Back to raw idToken - no Bearer prefix
    },
  });

  // Wrap the request method to handle auth errors
  const originalRequest = graphqlClient.request.bind(graphqlClient);
  graphqlClient.request = async (
    document: any,
    variables?: any,
    requestHeaders?: any
  ) => {
    try {
      const result = await originalRequest(document, variables, requestHeaders);
      return result;
    } catch (error: any) {
      console.error('Error:', error);

      // If we get a 401, it means the refresh failed - only then force logout
      if (
        error.response?.status === 401 ||
        error.response?.errors?.[0]?.message?.includes('Unauthorized')
      ) {
        signOut({ redirect: true, callbackUrl: '/login' });
      }

      throw error;
    }
  };

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  if (status === 'loading') {
    return <span>loading...</span>;
  }

  // Define resources based on role
  const adminResources = [
    {
      name: 'whiskey',
      list: '/whiskey',
      create: '/whiskey/create',
      edit: '/whiskey/edit/:id',
      show: '/whiskey/show/:id',
      meta: {
        canDelete: false,
      },
    },
    {
      name: 'brand',
      list: '/brand',
      show: '/brand/show/:id',
      edit: '/brand/edit/:id',
      meta: {
        canDelete: false,
      },
    },
    {
      name: 'review',
      list: '/specialistReview',
      create: '/specialistReview/create',
      edit: '/specialistReview/edit/:id',
      show: '/specialistReview/show/:id',
      meta: {
        canDelete: true,
      },
    },
    {
      name: 'suggestion',
      list: '/suggestion',
      show: '/suggestion/show/:id',
      meta: {
        canDelete: true,
      },
    },
    {
      name: 'userReward',
      list: '/userReward',
      edit: '/userReward/edit/:id',
      show: '/userReward/show/:id',
      meta: {
        canDelete: true,
      },
    },
    {
      name: 'adCampaign',
      list: '/adCampaign',
      create: '/adCampaign/create',
      edit: '/adCampaign/edit/:id',
      show: '/adCampaign/show/:id',
      meta: {
        canDelete: true,
      },
    },
    {
      name: 'adReport',
      list: '/adReport',
      show: '/adReport/show/:id',
      meta: {
        canDelete: true,
      },
    },
    {
      name: 'reward',
      list: '/reward',
      edit: '/reward/edit/:id',
      show: '/reward/show/:id',
      meta: {
        canDelete: false,
      },
    },
    {
      name: 'report',
      list: '/report',
      show: '/report/show/:id',
      meta: {
        canDelete: true,
      },
    },
    {
      name: 'article',
      list: '/article',
      create: '/article/create',
      edit: '/article/edit/:id',
      show: '/article/show/:id',
      meta: {
        canDelete: true,
      },
    },
    {
      name: 'featureFlags',
      list: '/featureFlags',
      create: '/featureFlags/create',
      edit: '/featureFlags/edit/:id',
      show: '/featureFlags/show/:id',
      meta: {
        canDelete: false,
      },
    },
    // Menu group only — no routes, so it renders as an expandable parent in the sider
    {
      name: 'tastingPassport',
      meta: {
        label: 'Tasting Passport',
      },
    },
    {
      name: 'tastingEvent',
      list: '/tastingEvent',
      create: '/tastingEvent/create',
      edit: '/tastingEvent/edit/:id',
      meta: {
        label: 'Tasting Events',
        parent: 'tastingPassport',
        canDelete: true,
      },
    },
    {
      name: 'tastingBooth',
      list: '/tastingBooth',
      create: '/tastingBooth/create',
      edit: '/tastingBooth/edit/:id',
      meta: {
        label: 'Tasting Booths',
        parent: 'tastingPassport',
        canDelete: true,
      },
    },
    {
      name: 'tastingPour',
      list: '/tastingPour',
      create: '/tastingPour/create',
      edit: '/tastingPour/edit/:id',
      meta: {
        label: 'Tasting Pours',
        parent: 'tastingPassport',
        canDelete: true,
      },
    },
    {
      name: 'tastingLead',
      list: '/tastingLead',
      meta: {
        label: 'Lead Export',
        parent: 'tastingPassport',
        canDelete: false,
      },
    },
    {
      name: 'general',
      list: '/general',
      meta: {
        label: 'General',
      },
    },
    {
      name: 'venue',
      list: '/venue',
      show: '/venue/show/:id',
      create: '/venue/create',
      edit: '/venue/edit/:id',
      meta: {
        canDelete: false,
      },
    },
    {
      name: 'venueRequest',
      list: '/venueRequest',
      edit: '/venueRequest/edit/:id',
      show: '/venueRequest/show/:id',
      meta: {
        canDelete: true,
      },
    },
    {
      name: 'CMSUser',
      list: '/CMSUser',
      create: '/CMSUser/create',
      edit: '/CMSUser/edit/:id',
      show: '/CMSUser/show/:id',
      meta: {
        label: 'Brand Owners',
        canDelete: false,
      },
    },
    {
      name: 'club',
      list: '/club',
      create: '/club/create',
      edit: '/club/edit/:id',
      show: '/club/show/:id',
      meta: {
        label: 'Clubs',
        canDelete: false,
      },
    },
    {
      name: 'clubRequest',
      list: '/clubRequest',
      show: '/clubRequest/show/:id',
      meta: {
        label: 'Club Requests',
        canDelete: false,
      },
    },
  ];

  const brandOwnerResources = [
    {
      name: 'whiskey',
      list: '/whiskey',
      create: '/whiskey/create',
      edit: '/whiskey/edit/:id',
      show: '/whiskey/show/:id',
      meta: {
        canDelete: false,
      },
    },
    {
      name: 'brand',
      list: '/brand',
      show: '/brand/show/:id',
      edit: '/brand/edit/:id',
      meta: {
        canDelete: false,
      },
    },

    // {
    //   name: 'CMSUserBrand',
    //   list: '/CMSUser',
    //   create: '/CMSUser/create',
    //   edit: '/CMSUser/edit/:id',
    //   show: '/CMSUser/show/:id',
    //   meta: {
    //     label: 'Brand Owners',
    //     canDelete: true,
    //   },
    // },
  ];

  const brandEditorResources = [
    {
      name: 'whiskey',
      list: '/whiskey',
      create: '/whiskey/create',
      edit: '/whiskey/edit/:id',
      show: '/whiskey/show/:id',
      meta: {
        canDelete: false,
      },
    },
    {
      name: 'brand',
      list: '/brand',
      show: '/brand/show/:id',
      edit: '/brand/edit/:id',
      meta: {
        canDelete: false,
      },
    },
  ];

  const resources =
    role === CMSUserRole.BrandOwner
      ? brandOwnerResources
      : role === CMSUserRole.BrandEditor
      ? brandEditorResources
      : adminResources;

  const authProvider: AuthBindings = {
    login: async () => {
      signIn('cognito', {
        callbackUrl: to ? to.toString() : '/whiskey',
        redirect: true,
      });

      return {
        success: true,
      };
    },
    logout: async () => {
      // Simply use NextAuth's signOut which will clear both NextAuth and provider sessions
      signOut({
        redirect: true,
        callbackUrl: '/login',
      });

      return {
        success: true,
      };
    },
    onError: async (error) => ({
      error,
    }),
    check: async () => {
      if (status === 'unauthenticated') {
        return {
          authenticated: false,
          redirectTo: '/login',
        };
      }

      // If a user has no brands assigned, redirect to no-brands-assigned page

      if (hasNoBrandsAssigned) {
        return {
          authenticated: true,
          redirectTo: '/no-brands-assigned',
        };
      }

      return {
        authenticated: true,
      };
    },
    getPermissions: async () => role,
    getIdentity: async () => {
      if (data?.user) {
        const { user } = data;
        return {
          name: user.name,
          avatar: user.image,
        };
      }

      return null;
    },
  };

  return (
    <RefineKbarProvider>
      <ColorModeContextProvider>
        <AntdApp>
          <Refine
            routerProvider={routerProvider}
            dataProvider={dataProvider(graphqlClient)}
            notificationProvider={useNotificationProvider}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
            resources={resources}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              useNewQueryKeys: true,
            }}
          >
            <Head>
              <title>Whiskey Social</title>
            </Head>
            {children}
            <RefineKbar />
            <UnsavedChangesNotifier />
          </Refine>
        </AntdApp>
      </ColorModeContextProvider>
    </RefineKbarProvider>
  );
};

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout): JSX.Element => {
  const renderComponent = () => {
    if (Component.noLayout) {
      // @ts-ignore
      return <Component {...pageProps} />;
    }

    return (
      <ThemedLayoutV2
        Header={() => <Header sticky />}
        Sider={(props) => <ThemedSiderV2 {...props} fixed />}
        Title={({ collapsed }) => (
          <ThemedTitleV2 collapsed={collapsed} icon={<AppIcon />} text="" />
        )}
      >
        {/* Page-level error boundary preserves layout when a page component fails */}
        <ErrorBoundary>
          {/* @ts-ignore */}
          <Component {...pageProps} />
        </ErrorBoundary>
      </ThemedLayoutV2>
    );
  };

  return (
    <SessionProvider session={session}>
      <PermissionContextProvider>
        <ErrorBoundary>
          <App>{renderComponent()}</App>
        </ErrorBoundary>
      </PermissionContextProvider>
    </SessionProvider>
  );
};

export default appWithTranslation(MyApp);
