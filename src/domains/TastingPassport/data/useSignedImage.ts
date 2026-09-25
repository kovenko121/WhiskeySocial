import { getS3Image } from '@helpers';
import { ImageUrl, S3Object } from '@types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createLogger } from '../../../services/logger';

const logger = createLogger('tastingPassportImage');

const RETRY_DELAYS_MS = [400, 1200];

// The grid remounts on every return to the Passport and the leaderboard re-reads on a timer, so a
// missing asset would otherwise report on every pass.
const reported = new Set<string>();

type FailureStage = 'sign' | 'download';

type SignedImageContext = {
  subject: string;
  boothId?: string;
  brand?: string;
};

/**
 * Signs an S3 product/brand shot for display, and hands back an `onError` for the image.
 *
 * A failure at either hop is retried on a short backoff before the caller's fallback stands, and
 * the last one is reported so a logo that never arrives is distinguishable from a brand that has
 * none on file.
 */
export const useSignedImage = (image?: S3Object | null, context?: SignedImageContext) => {
  const { subject = 'image', boothId, brand } = context ?? {};

  const [source, setSource] = useState<ImageUrl | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const retriesUsed = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Declared ahead of the load effect so a new image resets the ladder in the same commit.
  useEffect(() => {
    retriesUsed.current = 0;
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [image]);

  const fail = useCallback(
    (stage: FailureStage, error: Error) => {
      setSource(null);

      const delay = RETRY_DELAYS_MS[retriesUsed.current];
      if (delay !== undefined) {
        retriesUsed.current += 1;
        retryTimer.current = setTimeout(() => setReloadTick((tick) => tick + 1), delay);
        return;
      }

      const objectKey = `${image?.bucket}/${image?.region}/${image?.key}`;
      if (reported.has(objectKey)) return;
      reported.add(objectKey);

      logger.error(`Tasting Passport ${subject} failed to load`, error, {
        tags: { subject },
        extra: {
          stage,
          attempts: RETRY_DELAYS_MS.length + 1,
          boothId,
          brand,
          bucket: image?.bucket,
          region: image?.region,
          key: image?.key,
        },
      });
    },
    [image, subject, boothId, brand]
  );

  useEffect(() => {
    let active = true;
    if (!image) {
      setSource(null);
      return undefined;
    }

    const retry = retriesUsed.current;
    getS3Image(image)
      .then((resolved) => {
        if (!active || !resolved) return;
        // A retry needs a fresh cacheKey or expo-image replays its own cached failure.
        setSource(
          retry === 0
            ? resolved
            : { ...resolved, cacheKey: `${resolved.cacheKey ?? image.key}-retry${retry}` }
        );
      })
      .catch((error) => {
        if (!active) return;
        fail('sign', error instanceof Error ? error : new Error(String(error)));
      });

    return () => {
      active = false;
    };
  }, [image, reloadTick, fail]);

  const onError = useCallback(
    (event?: { error?: string }) => {
      fail('download', new Error(event?.error || 'Image download failed'));
    },
    [fail]
  );

  return { source, onError };
};
