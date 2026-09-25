export const setApostrophe = (name: string | undefined | null) => {
  if (name && name?.endsWith('s')) {
    return `${name}'`;
  }
  return `${name}'s`;
};
