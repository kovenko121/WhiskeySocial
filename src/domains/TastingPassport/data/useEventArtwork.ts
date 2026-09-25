/**
 * Resolves an event's CMS-uploaded artwork to an image source, falling back to the
 * standard Whiskey Social watermark when the event has no upload, the signing fails,
 * or the image itself fails to render.
 *
 * Returns a source rather than a component so each surface keeps its own sizing —
 * the Discover card and the Passport header size their logo panels differently.
 */
import { getS3Image } from '@helpers';
import { ImageUrl, S3Object } from '@types';
import { useEffect, useState } from 'react';
import { ImageSourcePropType } from 'react-native';

// Standard event watermark: the wordmark in dark ink, which is what reads on the
// white logo panel both surfaces use. Never event-specific artwork.
const EVENT_WATERMARK = require('../../../../assets/images/logo-light.png');

type EventArtwork = {
  source: ImageSourcePropType;
  /** True while showing the watermark — surfaces can inset it differently to the real artwork. */
  isWatermark: boolean;
  /** Pass to the Image's onError so a broken URL degrades to the watermark. */
  onError: () => void;
};

export const useEventArtwork = (image?: S3Object | null): EventArtwork => {
  const [source, setSource] = useState<ImageUrl | null>(null);

  useEffect(() => {
    let active = true;
    if (!image) {
      setSource(null);
      return undefined;
    }
    getS3Image(image)
      .then((resolved) => {
        if (active && resolved) setSource(resolved);
      })
      .catch(() => {
        // Signing failed — keep the watermark.
      });
    return () => {
      active = false;
    };
  }, [image]);

  return {
    source: source ?? EVENT_WATERMARK,
    isWatermark: !source,
    onError: () => setSource(null),
  };
};
