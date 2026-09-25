import { useAuth } from '@contexts';
import { amplify, amplifyApiKey } from '@services';
import { User, UserType } from '@types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createRegexpSearchString } from '../../helpers/search';
import { SearchUsers } from './query/SearchUsers';

const resolveUserType = (type?: UserType) => {
  if (type === UserType.VENUE) return UserType.VENUE;
  if (type === UserType.BRAND) return UserType.BRAND;
  return UserType.PERSON;
};

const resolveSortField = (type?: UserType) => {
  if (type === UserType.VENUE) return 'venueSearchName';
  if (type === UserType.BRAND) return 'brandSearchName';
  return 'personFullName';
};

function useUsers(search?: string, type?: UserType) {
  const { user, isGuest } = useAuth();
  const sub = user?.sub;
  const client = isGuest ? amplifyApiKey : amplify;

  const cleanedSearch = search?.replace('@', '');

  const regexpSearch = `${createRegexpSearchString(cleanedSearch ?? '')}.*`;

  const excludeSelf = sub ? [{ id: { ne: sub } }] : [];

  const filter: any = {
    and: [
      {
        or: [],
      },
      { deleted: { eq: false } },
      { archived: { ne: true } },
      {
        userType: {
          eq: resolveUserType(type),
        },
      },
      ...excludeSelf,
    ],
  };

  const isGlobalSearch = search?.charAt(0) !== '@';

  filter.and[0].or.push({
    and: regexpSearch
      .split(' ')
      .map((item) => ({ username: { regexp: item } })),
  });

  if (isGlobalSearch) {
    filter.and[0].or.push({
      and: regexpSearch
        .split(' ')
        .map((item) => {
          if (type === UserType.VENUE) {
            return { venueSearchName: { regexp: item } };
          } if (type === UserType.BRAND) {
            return { brandSearchName: { regexp: item } };
          } 
            return { personFullName: { regexp: item } };
          
        }),
    });
  }

  return useInfiniteQuery<{ nextToken: string; items: User[] }>({
    queryKey: ['get-users', type, search, isGuest],
    queryFn: async ({ pageParam }) => {
      const { searchUsers } = await client.request<{
        searchUsers: { nextToken: string; items: User[] };
      }>(SearchUsers, {
        nextToken: pageParam || null,
        filter,
        sort: {
          field: resolveSortField(type),
          direction: 'asc',
        },
        limit: 10,
      });

      return searchUsers;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextToken || null,
  });
}

export { useUsers };
