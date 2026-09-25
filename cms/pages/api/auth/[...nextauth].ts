/* eslint-disable no-param-reassign */
import NextAuth from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
import { GraphQLClient } from 'graphql-request';
import { LIST_CMS_USER_BRANDS_BY_CMS_USER_ID } from '../../../src/graphql/queries/cmsUserBrand';
import { CMSUserRole } from '../../../src/graphql-data-provider/utils/graphQlTypes';

// Helper function to extract groups from JWT token
function extractGroupsFromToken(idToken: string): string[] {
  try {
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    return payload['cognito:groups'] || [];
  } catch (error) {
    console.error('Error extracting groups from token:', error);
    return [];
  }
}

// Helper function to fetch brand associations for BrandOwner and Editor users
async function fetchBrandUserIds(
  cmsUserId: string,
  idToken: string
): Promise<string[]> {
  try {
    // Create GraphQL client with authorization header
    const graphqlClient = new GraphQLClient(process.env.API_URL!, {
      headers: {
        authorization: idToken,
      },
    });

    const response = (await graphqlClient.request(
      LIST_CMS_USER_BRANDS_BY_CMS_USER_ID,
      {
        cmsUserId,
      }
    )) as any;

    const brandUserIds =
      response.listCMSUserBrands?.items?.map((item: any) => item.brandUserId) ||
      [];

    return brandUserIds;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('=== fetchBrandUserIds ERROR ===');
      console.error('Error details:', error);
      // This is smelly - The TS in this app is very bad, and it's coming from the GraphQL layer where the types aren't being handled right.
      console.error('Error message:', (error as any)?.message);
      console.error('Error stack:', (error as any)?.stack);
      console.error('=== fetchBrandUserIds ERROR END ===');
    } else {
      console.error('Error in fetchBrandUserIds');
    }
    return [];
  }
}

export const authOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      // Validate Admin, BrandOwner, or Editor group membership for Cognito users
      if (account?.provider === 'cognito' && account.id_token) {
        const groups = extractGroupsFromToken(account.id_token);

        if (
          !groups.includes('Admin') &&
          !groups.includes('BrandOwner') &&
          !groups.includes('BrandEditor')
        ) {
          console.error(
            `Access denied: User ${
              user.email
            } not in Admin, BrandOwner, or BrandEditor group. Groups: ${groups.join(
              ', '
            )}`
          );
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Only pass essential data to client-side session to reduce cookie size
      session.user.id = token.sub;

      // Pass both tokens - idToken for API calls, accessToken for token refresh
      session.idToken = token.idToken;
      session.accessToken = token.accessToken;

      // Keep minimal group info
      session.groups = token.groups || [];

      // Set role based on Cognito groups
      // Note: groups.includes() checks use string literals because they compare against actual Cognito group names
      if (token.groups?.includes('Admin')) {
        session.role = CMSUserRole.Admin;
      } else if (token.groups?.includes('BrandOwner')) {
        session.role = CMSUserRole.BrandOwner;

        // Only fetch brand associations if we don't have them cached in token
        if (!token.brandUserIds) {
          const brandUserIds = await fetchBrandUserIds(
            token.sub,
            token.idToken
          );
          // Cache the brand IDs in the token for next time
          token.brandUserIds = brandUserIds;
        }
        session.brandUserIds = token.brandUserIds;
      } else if (token.groups?.includes('BrandEditor')) {
        session.role = CMSUserRole.BrandEditor;

        // BrandEditors also need brand associations, same as BrandOwners
        if (!token.brandUserIds) {
          const brandUserIds = await fetchBrandUserIds(
            token.sub,
            token.idToken
          );
          // Cache the brand IDs in the token for next time
          token.brandUserIds = brandUserIds;
        }
        session.brandUserIds = token.brandUserIds;
      } else {
        session.role = null; // No valid role
      }

      // Check if token needs refresh (for client-side awareness)
      session.tokenExpires = token.accessTokenExpires;

      return session;
    },
    async jwt({ token, account }: { token: any; account: any }) {
      if (account) {
        // Store tokens from Cognito
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000; // Default 1 hour

        // Extract and store groups from ID token
        token.groups = extractGroupsFromToken(account.id_token);

        // Clear cached brandUserIds on new sign in
        delete token.brandUserIds;
      }

      // Check if token needs refresh (10 min buffer instead of 5)
      const now = Date.now();
      const shouldRefresh = now >= token.accessTokenExpires - 600000;

      if (!shouldRefresh) {
        return token;
      }

      // Attempt refresh with error handling
      try {
        const refreshedToken = await refreshAccessToken(token);

        // Preserve cached data
        if (token.brandUserIds) {
          refreshedToken.brandUserIds = token.brandUserIds;
        }

        return refreshedToken;
      } catch (error) {
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  session: {
    // Use JWT tokens instead of database sessions for better performance
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Enable debug logging in development
  debug: process.env.NODE_ENV === 'development',
};

// Enhanced token refresh function with retry logic
async function refreshAccessToken(token: any) {
  const maxRetries = 2;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const url = `${process.env.COGNITO_ISSUER}/oauth2/token`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.COGNITO_CLIENT_ID}:${process.env.COGNITO_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken,
        }),
        method: 'POST',
      });

      const refreshedTokens = await response.json();

      if (!response.ok) {
        throw new Error(
          `Refresh failed: ${response.status} - ${
            refreshedTokens.error || 'Unknown error'
          }`
        );
      }

      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        idToken: refreshedTokens.id_token,
        accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
        refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        groups: refreshedTokens.id_token
          ? extractGroupsFromToken(refreshedTokens.id_token)
          : token.groups,
        error: undefined, // Clear any previous errors
      };
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
}

export default NextAuth(authOptions);
