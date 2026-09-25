export const normalizeApostrophes = (value: string) =>
  value.replaceAll('’', "'").replaceAll('‘', "'").replaceAll('`', "'");
