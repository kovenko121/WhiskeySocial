export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const capitalizeAll = (str: string) =>
  str.split(' ').map(capitalize).join(' ');
  
