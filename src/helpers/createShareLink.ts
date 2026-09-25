export type ShareLinkType = 'club' | 'user' | 'whiskey' | 'post' | 'article';

type ShareLinkParams = {
  type: ShareLinkType;
  id: string;
};

const buildPath = (type: ShareLinkType, id: string): string => {
  const pathMap: Record<ShareLinkType, string> = {
    club: `club/${id}`,
    user: `user/${id}`,
    whiskey: `whiskey/${id}`,
    post: `post/${id}`,
    article: `article/${id}`,
  };
  return pathMap[type];
};

export const createShareLink = ({ type, id }: ShareLinkParams): string =>
  `https://whiskeysocial.app/${buildPath(type, id)}`;
