export type SortAccessor<T> = string | string[] | ((record: T) => unknown);

const resolve = <T>(record: T, accessor: SortAccessor<T>): unknown => {
  if (typeof accessor === 'function') {
    return accessor(record);
  }

  const path = Array.isArray(accessor) ? accessor : [accessor];

  return path.reduce<any>(
    (value, key) => (value === null || value === undefined ? value : value[key]),
    record
  );
};

const isBlank = (value: unknown) =>
  value === null || value === undefined || value === '';

const compare = <T>(
  a: T,
  b: T,
  accessor: SortAccessor<T>,
  comparator: (left: unknown, right: unknown) => number
) => {
  const left = resolve(a, accessor);
  const right = resolve(b, accessor);

  if (isBlank(left) && isBlank(right)) {
    return 0;
  }
  if (isBlank(left)) {
    return 1;
  }
  if (isBlank(right)) {
    return -1;
  }

  return comparator(left, right);
};

export const textSorter =
  <T>(accessor: SortAccessor<T>) =>
  (a: T, b: T) =>
    compare(a, b, accessor, (left, right) =>
      String(left).localeCompare(String(right), undefined, {
        sensitivity: 'base',
        numeric: true,
      })
    );

export const numberSorter =
  <T>(accessor: SortAccessor<T>) =>
  (a: T, b: T) =>
    compare(a, b, accessor, (left, right) => Number(left) - Number(right));

export const dateSorter =
  <T>(accessor: SortAccessor<T>) =>
  (a: T, b: T) =>
    compare(
      a,
      b,
      accessor,
      (left, right) =>
        new Date(left as string).getTime() - new Date(right as string).getTime()
    );

export const booleanSorter =
  <T>(accessor: SortAccessor<T>) =>
  (a: T, b: T) =>
    Number(Boolean(resolve(a, accessor))) -
    Number(Boolean(resolve(b, accessor)));
