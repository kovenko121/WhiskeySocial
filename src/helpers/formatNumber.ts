export const formatNumber = (number: number) => {
  if (number > 1000000000) {
    return `${(number / 1000000000).toFixed(1)}b`;
  }
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(1)}m`;
  }
  if (number > 1000) {
    return `${(number / 1000).toFixed(1)}k`;
  }
  return number || 0;
};
