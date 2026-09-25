import { useAuth } from '@contexts';
import { amplifyApiKey, queryClient } from '@services';
import { FeatureFlags } from '@types';
import { useQuery } from '@tanstack/react-query';
import { ListFeatureFlags } from './query/listFeatureFlags';

/** Raw flag as stored: the string value plus an optional per-user allowlist. */
type RawFlag = {
  value: string;
  allowedUserIds: string[];
};

const FEATURE_FLAGS_QUERY_KEY = ['get-feature-flags'];

const FEATURE_FLAGS_LOAD_TIMEOUT_MS = 4000;

const NO_FLAGS: Record<string, RawFlag> = {};

/**
 * Fetches flags in their raw form (value + allowlist), keyed by flag key. This is
 * cached user-agnostically so the App.tsx startup prefetch can run before login;
 * per-user evaluation happens at read time in `useFeatureFlags` via `select`.
 */
const fetchFeatureFlags = async (): Promise<Record<string, RawFlag>> => {
  const { listFeatureFlags } = await amplifyApiKey.request<{
    listFeatureFlags: { items: FeatureFlags[] };
  }>(ListFeatureFlags);

  return (
    listFeatureFlags?.items.reduce<Record<string, RawFlag>>(
      (acc, { key, value, allowedUserIds }) => ({
        ...acc,
        [key]: {
          value,
          allowedUserIds: (allowedUserIds ?? []).filter(
            (id): id is string => !!id
          ),
        },
      }),
      {}
    ) ?? {}
  );
};

/**
 * Resolve raw flags to booleans for a given user. A flag with a non-empty
 * allowlist is ON only for the listed users (a targeted rollout, `value`
 * ignored); otherwise it follows `value` for everyone.
 */
const evaluateFlags = (
  raw: Record<string, RawFlag> | undefined,
  userId?: string
): Record<string, boolean> =>
  Object.entries(raw ?? {}).reduce<Record<string, boolean>>(
    (acc, [key, { value, allowedUserIds }]) => ({
      ...acc,
      [key]: allowedUserIds.length
        ? !!userId && allowedUserIds.includes(userId)
        : value === 'true',
    }),
    {}
  );

const useFeatureFlags = () => {
  const { user } = useAuth();
  const userId: string | undefined = user?.sub;

  return useQuery({
    queryKey: FEATURE_FLAGS_QUERY_KEY,
    queryFn: fetchFeatureFlags,
    select: (raw) => evaluateFlags(raw, userId),
  });
};

const useFeatureFlagValue = (key: string) =>
  useQuery({
    queryKey: FEATURE_FLAGS_QUERY_KEY,
    queryFn: fetchFeatureFlags,
    select: (raw) => raw[key]?.value ?? '',
  });

const settleWithNoFlags = () => {
  if (!queryClient.getQueryData(FEATURE_FLAGS_QUERY_KEY)) {
    queryClient.setQueryData(FEATURE_FLAGS_QUERY_KEY, NO_FLAGS);
  }
};

const loadFeatureFlags = () => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timingOut = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      settleWithNoFlags();
      resolve();
    }, FEATURE_FLAGS_LOAD_TIMEOUT_MS);
  });

  const fetching = queryClient
    .fetchQuery({
      queryKey: FEATURE_FLAGS_QUERY_KEY,
      queryFn: fetchFeatureFlags,
      retry: 1,
    })
    .catch(settleWithNoFlags)
    .finally(() => clearTimeout(timer));

  return Promise.race([fetching, timingOut]);
};

export { loadFeatureFlags, useFeatureFlags, useFeatureFlagValue };
