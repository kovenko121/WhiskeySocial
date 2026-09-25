// Import ProofType from Amplify-generated API types to avoid duplicate enum exports.
// Not re-exported here: the `@types` barrel already star-exports it from './api',
// and re-exporting makes the name ambiguous across the barrel's star exports.
import { ProofType } from './api';

// Label mapping for display
// NOTE: Required because GraphQL enum values cannot contain spaces
// GraphQL stores: CASK_STRENGTH -> Display shows: "Cask Strength"
export const PROOF_TYPE_LABELS: Record<ProofType, string> = {
  [ProofType.NUMERIC]: 'Proof',
  [ProofType.CASK_STRENGTH]: 'Cask Strength',
  [ProofType.BARREL_PROOF]: 'Barrel Proof',
  [ProofType.FULL_PROOF]: 'Full Proof',
};

// Helper function to get display value for bottles or whiskeys
// A stored proof of 0 means "not recorded" and is treated as unset (WHI-172/WHI-173).
// A designation and a number are independent: a barrel-proof bottle still has a
// number, it just varies per batch, so both render when both are present.
export const getProofDisplay = (
  item?: {
    proof?: number | null;
    proofType?: ProofType | null;
  } | null
): string => {
  if (!item) {
    return '';
  }

  const number =
    item.proof != null && item.proof !== 0 ? item.proof.toString() : '';

  const designation =
    item.proofType && item.proofType !== ProofType.NUMERIC
      ? PROOF_TYPE_LABELS[item.proofType]
      : '';

  if (number && designation) {
    return `${number} · ${designation}`;
  }

  return number || designation;
};

export interface ProofOption {
  label: string;
  value: ProofType;
}

export const PROOF_OPTIONS: ProofOption[] = [
  { label: 'Proof', value: ProofType.NUMERIC },
  { label: 'Cask Strength', value: ProofType.CASK_STRENGTH },
  { label: 'Barrel Proof', value: ProofType.BARREL_PROOF },
  { label: 'Full Proof', value: ProofType.FULL_PROOF },
];
