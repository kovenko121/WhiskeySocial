import { DefaultSession } from 'next-auth';
import { CMSUserRole } from '../src/graphql-data-provider/utils/graphQlTypes';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    idToken?: string;
    groups?: string[];
    tokenExpires?: number;
    error?: string;
    role?: CMSUserRole | null;
    brandUserIds?: string[];
    user: {
      id?: string;
    } & DefaultSession['user'];
  }

  interface JWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    groups?: string[];
    sub?: string;
    error?: string;
  }
}
