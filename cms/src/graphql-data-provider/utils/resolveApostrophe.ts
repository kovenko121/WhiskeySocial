export const resolveApostrophe = (inputString?: string): string => {
  if (inputString) {
    // Check if inputString is actually a string
    if (typeof inputString !== 'string') {
      return String(inputString); // Convert to string as fallback
    }

    // replaces temporally all the characters similar to apostrophe with a * (which is uncommon)
    // so that it avoids malformation error when triggering the list query if filter
    return inputString
      .replaceAll('’', '*') // right single quotation mark
      .replaceAll('‘', '*') // left single quotation mark
      .replaceAll('`', '*') // grave accent
      .replaceAll('´', '*') // acute accent
      .replaceAll("'", '*'); // straight single quote
  }

  return '';
};

export const restoreApostrophe = (inputString?: string): string => {
  if (inputString) {
    // replaces the * character to apostrophe
    return inputString.replaceAll('*', "'");
  }
  return '';
};

export const normalizeInputApostrophe = (inputString?: string): string => {
  if (inputString) {
    // use this to avoid user create or edit an element using the wrong apostrophe character
    return inputString
      .replaceAll('’', "'")
      .replaceAll('‘', "'")
      .replaceAll('`', "'")
      .replaceAll('´', "'");
  }
  return '';
};
