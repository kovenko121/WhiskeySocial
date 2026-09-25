import { getBlob, rankScanCandidates, buildScanSearchFilters } from '@helpers';
import type { ScannedLabel, ScannedMatch } from '@helpers';
import { createImageKey } from '@whiskey-social/image-keys';
import { useMutation } from '@tanstack/react-query';
import { amplify } from '@services';
import type { Whiskey } from '@types';
import { Storage } from 'aws-amplify';
import { IdentifyWhiskeyFromImage } from './mutation/identifyWhiskeyFromImage';
import { ScanWhiskeyCandidates } from './query/scanWhiskeyCandidates';

const CANDIDATE_LIMIT = 100;

export type ScanOutcome =
  | { status: 'matched'; imageKey: string; label: ScannedLabel; matches: ScannedMatch[] }
  | { status: 'noMatch'; imageKey: string; label: ScannedLabel }
  | { status: 'notWhiskey'; imageKey: string; message: string }
  | { status: 'rateLimited'; imageKey: string; message: string }
  | { status: 'failed'; imageKey: string | null; message: string };

type IdentifyResponse = {
  identifyWhiskeyFromImage: {
    isWhiskeyDetected: boolean;
    rateLimitExceeded: boolean | null;
    error: string | null;
    message: string | null;
    extractedInfo: (ScannedLabel & { fullLabelText?: string | null }) | null;
  } | null;
};

type CandidateResponse = { searchWhiskeys: { items: (Whiskey | null)[] | null } | null };

const GENERIC_FAILURE =
  'Scan is unavailable right now — please try searching by name instead.';

const uploadScanImage = async (imageUri: string) => {
  const fileName = imageUri.split('/').pop();

  if (!fileName) throw new Error('Could not read the captured photo.');

  const imageKey = createImageKey('whiskey', fileName);
  const blob = await getBlob(imageUri);

  await Storage.put(imageKey, blob, { level: 'public' });

  return imageKey;
};

const fetchCandidates = async (label: ScannedLabel) => {
  const filters = buildScanSearchFilters(label);

  const pages = await Promise.all(
    filters.map((filter) =>
      amplify
        .request<CandidateResponse>(ScanWhiskeyCandidates, {
          limit: CANDIDATE_LIMIT,
          filter,
        })
        .catch(() => null)
    )
  );

  return pages.flatMap(
    (page) => (page?.searchWhiskeys?.items ?? []).filter(Boolean) as Whiskey[]
  );
};

const useScanWhiskeyLabel = () =>
  useMutation<ScanOutcome, unknown, { imageUri: string }>({
    mutationFn: async ({ imageUri }): Promise<ScanOutcome> => {
      let uploadedKey: string | null = null;

      try {
        const imageKey = await uploadScanImage(imageUri);
        uploadedKey = imageKey;

        const { identifyWhiskeyFromImage: result } =
          await amplify.request<IdentifyResponse>(IdentifyWhiskeyFromImage, {
            input: { imageKey },
          });

        if (!result) {
          return { status: 'failed', imageKey, message: GENERIC_FAILURE };
        }

        if (result.rateLimitExceeded) {
          return {
            status: 'rateLimited',
            imageKey,
            message: result.message ?? GENERIC_FAILURE,
          };
        }

        if (result.error) {
          return {
            status: 'failed',
            imageKey,
            message: result.message ?? GENERIC_FAILURE,
          };
        }

        if (!result.isWhiskeyDetected || !result.extractedInfo) {
          return {
            status: 'notWhiskey',
            imageKey,
            message:
              result.message ??
              "We couldn't detect a whiskey bottle. Try again with a clearer photo of the label.",
          };
        }

        const label = result.extractedInfo;
        const matches = rankScanCandidates(await fetchCandidates(label), label);

        if (!matches.length) {
          return { status: 'noMatch', imageKey, label };
        }

        return { status: 'matched', imageKey, label, matches };
      } catch (error) {
        return { status: 'failed', imageKey: uploadedKey, message: GENERIC_FAILURE };
      }
    },
  });

export { useScanWhiskeyLabel };
