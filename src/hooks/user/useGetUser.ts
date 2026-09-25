import { useAuth } from '@contexts';
import { getS3Image } from '@helpers';
import { amplify, amplifyApiKey } from '@services';
import { ImageUrl, User } from '@types';
import { useQuery } from '@tanstack/react-query';
import { GetUser } from './query/getUser';
import { GetUserPublic } from './query/getUserPublic';

type UserFetched = User & {
  coverPictureLoaded?: ImageUrl;
  profilePictureLoaded?: ImageUrl;
  brandLogoLoaded?: ImageUrl;
};

function useGetUser(id?: string) {
  const { user, isGuest } = useAuth();
  const sub = user?.sub;
  const client = isGuest ? amplifyApiKey : amplify;

  return useQuery<UserFetched>(
    {
      queryKey: ['get-user', id || sub, isGuest],
      enabled: !!(id || sub),
      queryFn: async () => {
        const query = isGuest ? GetUserPublic : GetUser;
        const { getUser } = await client.request<{ getUser: User }>(query, {
          id: id || sub,
        });

        const userFetched: UserFetched = {
          ...getUser,
        };

        if (getUser.profilePicture) {
          const profilePicture = await getS3Image(getUser.profilePicture);
          if (profilePicture) {
            userFetched.profilePictureLoaded = profilePicture;
          }
        }
        if (getUser.coverPicture) {
          const coverPicture = await getS3Image(getUser.coverPicture);
          if (coverPicture) {
            userFetched.coverPictureLoaded = coverPicture;
          }
        }
        if (getUser.brandLogo) {
          const brandLogo = await getS3Image(getUser.brandLogo);
          if (brandLogo) {
            userFetched.brandLogoLoaded = brandLogo;
          }
        }

        return userFetched;
      },
      staleTime: 5 * 60 * 1000,
    }
  );
}

export { useGetUser };