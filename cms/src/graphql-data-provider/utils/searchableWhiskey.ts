import { isOrFilter } from './handleOrFilter';
import { normalizeSearchName } from './normalizeSearchName';
import { normalizeInputApostrophe } from './resolveApostrophe';

const WHISKEY_LIST_FIELDS = `
    id
    name
    fullName
    brand
    brandId
    brandUser {
      id
      brandName
    }
    specialistChoice
    starterPick
    singleBarrel
  `;

const WHISKEY_SORT_FIELDS: { [field: string]: string } = {
  name: 'name',
  fullName: 'fullName',
  brand: 'brand',
  'brandUser.brandName': 'brand',
  distillery: 'distillery',
  origin: 'origin',
  age: 'age',
  proof: 'proof',
  calculatedRating: 'calculatedRating',
  specialistChoice: 'specialistChoice',
  starterPick: 'starterPick',
  singleBarrel: 'singleBarrel',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

const escapeRegexp = (value: string) =>
  value.replace(/[.?+*|{}[\]()"\\#@&<>~]/g, '\\$&');

const toSearchableCondition = (item: any): any => {
  if (isOrFilter(item)) {
    const conditions = item.value
      .map((condition: any) => toSearchableCondition(condition))
      .filter(Boolean);

    return conditions.length ? { or: conditions } : null;
  }

  const field = item?.field;
  const value = item?.value;

  if (!field || value === undefined || value === null || value === '') {
    return null;
  }

  if (item.operator === 'contains') {
    const words = normalizeSearchName(normalizeInputApostrophe(String(value)))
      .split(/[^\p{L}\p{N}']+/u)
      .filter(Boolean)
      .map((word) => ({ [field]: { regexp: `.*${escapeRegexp(word)}.*` } }));

    if (!words.length) {
      return null;
    }

    return words.length === 1 ? words[0] : { and: words };
  }

  if (item.operator === 'eq') {
    return { [field]: { eq: value } };
  }

  if (item.operator === 'ne') {
    return { not: { [field]: { eq: value } } };
  }

  return null;
};

export const buildSearchableFilter = (filters?: any[]) => {
  const conditions = (filters || [])
    .map((item) => toSearchableCondition(item))
    .filter(Boolean);

  if (!conditions.length) {
    return null;
  }

  return conditions.length === 1 ? conditions[0] : { and: conditions };
};

export const buildSearchableSort = (sorters?: any[]) => {
  const sort = (sorters || [])
    .map((sorter: any) => ({
      field: WHISKEY_SORT_FIELDS[sorter?.field],
      direction: sorter?.order,
    }))
    .filter((sorter) => Boolean(sorter.field) && Boolean(sorter.direction));

  return sort.length ? sort : null;
};

export const WHISKEY_SEARCH_QUERY = `
  query SearchWhiskeyList(
    $filter: SearchableWhiskeyFilterInput
    $sort: [SearchableWhiskeySortInput]
    $limit: Int
    $from: Int
  ) {
    searchWhiskeys(filter: $filter, sort: $sort, limit: $limit, from: $from) {
      items {
        ${WHISKEY_LIST_FIELDS}
      }
      total
    }
  }`;
