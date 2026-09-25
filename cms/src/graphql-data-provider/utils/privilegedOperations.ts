export type TokenTarget = 'input' | 'root';

export const PRIVILEGED_OPERATIONS: Record<string, TokenTarget> = {
  createVenue: 'input',
  updateVenue: 'input',
  deleteVenue: 'input',
  createBrandV2: 'input',
  transferVenue: 'root',
};

export const isPrivilegedOperation = (operationName?: string): boolean =>
  !!operationName && operationName in PRIVILEGED_OPERATIONS;
