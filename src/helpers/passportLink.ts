const PASSPORT_LINK =
  /^(?:whiskeysocial:\/+|https?:\/+whiskeysocial\.app\/+)passport\/([^/?#]+)/i;

export const getPassportEventId = (url?: string | null) => {
  if (!url) return undefined;
  return PASSPORT_LINK.exec(url.trim())?.[1];
};
