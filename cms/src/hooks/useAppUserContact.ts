import { useCustom } from '@refinedev/core';
import { useCognitoUserEmail } from './useCognitoUserEmail';

const getUserContactQuery = `
  query GetUserContact($id: ID!) {
    getUser(id: $id) {
      id
      username
      personFullName
      personFirstName
      personLastName
      venueName
      brandName
      userType
      deleted
    }
  }
`;

interface AppUserProfile {
  id: string;
  username?: string | null;
  personFullName?: string | null;
  personFirstName?: string | null;
  personLastName?: string | null;
  venueName?: string | null;
  brandName?: string | null;
  userType?: string | null;
  deleted?: boolean | null;
}

interface UseAppUserContactResult {
  name: string | null;
  username: string | null;
  userType: string | null;
  email: string | null;
  deleted: boolean;
  profileFound: boolean;
  loading: boolean;
  emailError: string | null;
}

const displayName = (user: AppUserProfile | null): string | null => {
  if (!user) {
    return null;
  }

  if (user.userType === 'VENUE') {
    return user.venueName || null;
  }

  if (user.userType === 'BRAND') {
    return user.brandName || null;
  }

  const composed = [user.personFirstName, user.personLastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return user.personFullName || composed || null;
};

export const useAppUserContact = (
  userId: string | undefined
): UseAppUserContactResult => {
  const { data, isLoading: profileLoading } = useCustom({
    url: '',
    method: 'get',
    meta: {
      query: getUserContactQuery,
      queryName: 'getUser',
      variables: {
        id: userId,
      },
    },
    queryOptions: {
      enabled: !!userId,
    },
  });

  const {
    email,
    loading: emailLoading,
    error: emailError,
  } = useCognitoUserEmail(userId);

  const user = (data?.data as AppUserProfile | null) || null;

  return {
    name: displayName(user),
    username: user?.username || null,
    userType: user?.userType || null,
    email,
    deleted: !!user?.deleted,
    profileFound: !!user,
    loading: !!userId && (profileLoading || emailLoading),
    emailError,
  };
};
