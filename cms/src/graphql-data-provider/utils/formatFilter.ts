import { restoreApostrophe } from './resolveApostrophe';

export const formatFilter = (inputString?: string): string => {
  if (inputString) {
    // Check if this is an OR filter (contains 'or: [')
    const isOrFilter = inputString.includes('or: [');
    
    let result = inputString
      .replaceAll('"', '')
      .replaceAll("'", '"'); // formats according to the graphql
    
    // Only remove brackets if it's NOT an OR filter
    if (!isOrFilter) {
      result = result
        .replaceAll('[', '') // removes some extra characters that the filter element comes with
        .replaceAll(']', '');
    }
    
    return restoreApostrophe(result);
  }
  return '';
};
