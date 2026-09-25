import { amplify } from '@services';
import { S3Object } from '@types';
import { useQuery } from '@tanstack/react-query';
import { Booth, BrandDetail } from '../types';
import { createLogger } from '../../../services/logger';
import { SearchPassportBrands } from './brandDetailsQuery';

const logger = createLogger('passportBrandDetails');

const PAGE_SIZE = 100;

const reported = new Set<string>();

type RawBrand = {
  id: string;
  brandName?: string | null;
  brandLogo?: S3Object | null;
  brandCoverImage?: S3Object | null;
  brandDescription?: string | null;
  brandStory?: string | null;
  brandWebsite?: string | null;
  brandCountry?: string | null;
  brandFoundedYear?: number | null;
};

type SearchResult = {
  searchUsers: { nextToken: string | null; items: RawBrand[] } | null;
};

const boothBrandIds = (booths: Booth[]): string[] => {
  const ids = booths
    .map((booth) => booth.brandUserId)
    .filter((id): id is string => Boolean(id));
  return [...new Set(ids)].sort();
};

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const fetchBatch = async (ids: string[]): Promise<RawBrand[]> => {
  const items: RawBrand[] = [];
  let nextToken: string | null = null;
  do {
    // eslint-disable-next-line no-await-in-loop -- cursor pagination is inherently sequential
    const result: SearchResult = await amplify.request<SearchResult>(SearchPassportBrands, {
      nextToken,
      limit: PAGE_SIZE,
      filter: { or: ids.map((id) => ({ id: { eq: id } })) },
    });
    items.push(...(result?.searchUsers?.items ?? []));
    nextToken = result?.searchUsers?.nextToken ?? null;
  } while (nextToken);
  return items;
};

export type BrandDetailMap = Map<string, BrandDetail>;

const EMPTY_MAP: BrandDetailMap = new Map();

const logolessBrandIds = (booths: Booth[]): Set<string> =>
  new Set(
    booths
      .filter((booth) => !booth.logo && booth.brandUserId)
      .map((booth) => booth.brandUserId as string),
  );

export const useBrandDetails = (booths: Booth[]) => {
  const ids = boothBrandIds(booths);
  const relyOnBrand = logolessBrandIds(booths);

  const query = useQuery<BrandDetailMap>({
    queryKey: ['passport-brand-details', ids.join(',')],
    enabled: ids.length > 0,
    queryFn: async () => {
      const map: BrandDetailMap = new Map();
      try {
        const batches = await Promise.all(
          chunk(ids, PAGE_SIZE).map((batch) => fetchBatch(batch)),
        );

        batches.flat().forEach((item) => {
          if (!item?.id) return;
          map.set(item.id, {
            brandUserId: item.id,
            brandName: item.brandName,
            brandLogo: item.brandLogo,
            brandCoverImage: item.brandCoverImage,
            brandDescription: item.brandDescription,
            brandStory: item.brandStory,
            brandWebsite: item.brandWebsite,
            brandCountry: item.brandCountry,
            brandFoundedYear: item.brandFoundedYear,
          });
        });

        const unresolved = ids.filter((id) => !map.has(id) && relyOnBrand.has(id));
        const signature = unresolved.join(',');
        if (unresolved.length > 0 && !reported.has(signature)) {
          reported.add(signature);
          logger.error(
            'Tasting Passport booths have no brand record and no logo of their own',
            new Error(`${unresolved.length} booth brand record(s) missing`),
            {
              tags: { subject: 'brandDetails' },
              extra: { requested: ids.length, resolved: map.size, unresolved },
            },
          );
        }
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to fetch the tasting booth brand records', normalizedError, {
          tags: { subject: 'brandDetails' },
          extra: { requested: ids.length },
        });
      }
      return map;
    },
  });

  return query.data ?? EMPTY_MAP;
};
