import { Whiskey } from '@types';

export const getFullWhiskeyName = (whiskey: Whiskey) => {
  const brandPrefix = whiskey?.brandUser?.brandName ?? whiskey?.brand;
  return brandPrefix ? `${brandPrefix} ${whiskey?.name}` : (whiskey?.name ?? '');
};
