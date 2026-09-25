import type { DefaultOptionType } from 'antd/es/select';

/**
 * refine's server-side select search sends `contains` straight to DynamoDB,
 * which is case-sensitive, so "buffalo" misses "Buffalo Trace". The tasting
 * selects hold their whole list in memory, so they match the rendered label
 * locally instead.
 */
export const filterByLabel = (input: string, option?: DefaultOptionType) =>
  String(option?.label ?? '')
    .toLowerCase()
    .includes(input.toLowerCase());

export default filterByLabel;
