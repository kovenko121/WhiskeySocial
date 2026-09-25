import { resolveApostrophe } from './resolveApostrophe';

interface FilterItem {
  field: string;
  operator: string;
  value: any;
}

interface OrFilterItem {
  operator: 'or';
  value: FilterItem[];
}

export const handleOrFilter = (orFilterItem: OrFilterItem): string | null => {
  // Check if all values in the OR filter are undefined/null
  const hasValidValue = orFilterItem.value.some(
    (condition: FilterItem) => condition.value !== undefined && condition.value !== null
  );

  // If all values are undefined/null, return null to skip this filter entirely
  if (!hasValidValue) {
    return null;
  }

  const orConditions = orFilterItem.value.map((condition: FilterItem) => {
    // Handle different field types that don't need apostrophe resolution
    const isSpecialField =
      condition.field === 'specialistChoice' ||
      condition.field === 'singleBarrel' ||
      condition.field === 'status' ||
      condition.field === 'starterPick' ||
      condition.field === 'isRedeemed' ||
      condition.field === 'specialistReview';

    const processedValue = isSpecialField
      ? condition.value
      : `"${resolveApostrophe(condition.value).replaceAll('&', 'ëéèê')}"`;

    return `{ ${condition.field}: { ${condition.operator}: ${processedValue} } }`;
  });

  const result = `or: [${orConditions.join(', ')}]`;
  return result;
};

export const isOrFilter = (item: any): item is OrFilterItem => item && item.operator === 'or' && Array.isArray(item.value);
