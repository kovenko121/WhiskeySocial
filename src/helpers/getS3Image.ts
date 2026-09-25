import { ImageUrl, S3Object } from '@types';
import { Storage } from 'aws-amplify';

// Storage.get() signs a URL that S3 rejects once it expires (aws-amplify's
// DEFAULT_PRESIGN_EXPIRATION is 900s). Entries are re-signed on a shorter
// clock so a URL handed out at the end of its TTL still has minutes of life.
const URL_TTL_MS = 10 * 60 * 1000;

// The menus render many cards at once, so keep the cache bounded rather than
// letting it grow with every image the session has ever scrolled past.
const MAX_ENTRIES = 250;

type CacheEntry = {
  url: Promise<string>;
  expiresAt: number;
};

// Keyed by bucket/region/key rather than key alone, since the same key can
// exist in more than one bucket.
const urlCache = new Map<string, CacheEntry>();

const cacheKeyFor = (pic: S3Object) => `${pic.bucket}/${pic.region}/${pic.key}`;

const dimensionsOf = (pic: S3Object) =>
  pic.width && pic.height ? { width: pic.width, height: pic.height } : {};

const evictStaleEntries = (now: number) => {
  urlCache.forEach((entry, key) => {
    if (entry.expiresAt <= now) urlCache.delete(key);
  });

  // Map iterates in insertion order, so the oldest entries drop out first.
  while (urlCache.size > MAX_ENTRIES) {
    const oldest = urlCache.keys().next();
    if (oldest.done) break;
    urlCache.delete(oldest.value);
  }
};

const getS3Image = async (
  pic: S3Object | null | undefined
): Promise<ImageUrl | false> => {
  if (!pic) return false;

  const key = cacheKeyFor(pic);
  const now = Date.now();
  const cached = urlCache.get(key);

  if (cached && cached.expiresAt > now) {
    return { uri: await cached.url, cacheKey: `${pic.key}key`, ...dimensionsOf(pic) };
  }

  // Cache the in-flight promise rather than only the result, so cards mounting
  // together share one Storage.get instead of racing.
  const url = Storage.get(pic.key, {
    bucket: pic.bucket,
    region: pic.region,
    contentType: 'image',
  }) as Promise<string>;

  const entry: CacheEntry = { url, expiresAt: now + URL_TTL_MS };
  urlCache.set(key, entry);

  // A rejected sign must not stay cached, or one transient failure would blank
  // the image for the rest of the TTL. The identity check leaves a newer entry
  // alone, in case this sign outlived its own TTL and was already replaced.
  // The rejection still reaches callers by way of the promise returned below.
  url.catch(() => {
    if (urlCache.get(key) === entry) urlCache.delete(key);
  });

  evictStaleEntries(now);

  return { uri: await entry.url, cacheKey: `${pic.key}key`, ...dimensionsOf(pic) };
};

export { getS3Image };
