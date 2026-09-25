import { useFeatureFlagValue } from '@hooks';
import { TastingEvent } from '../types';

const LEADERBOARD_OFF_FLAG = 'tastingLeaderboardOffEvents';

const normalize = (value: string) => value.trim().toLowerCase();

const offEntries = (value: string): string[] =>
  value
    .split(/[,;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const isLeaderboardOff = (event: TastingEvent, value: string): boolean =>
  offEntries(value).some(
    (entry) => entry === event.id || normalize(entry) === normalize(event.name)
  );

export const useShowLeaderboard = (event: TastingEvent): boolean => {
  const { data: offList } = useFeatureFlagValue(LEADERBOARD_OFF_FLAG);

  if (offList === undefined) return false;

  return !isLeaderboardOff(event, offList);
};
