import { amplify } from '@services';
import { gql } from 'graphql-request';

const ListClubsBySearchName = gql`
  query ListClubs($filter: ModelClubFilterInput) {
    listClubs(filter: $filter, limit: 1) {
      items {
        id
        clubName
        searchName
        __typename
      }
      __typename
    }
  }
`;

interface ValidateClubNameInput {
  clubName: string;
  currentClubId?: string; // To exclude current club when editing
}

interface ValidateClubNameResult {
  isAvailable: boolean;
  existingClubId?: string;
}

function useValidateClubName() {
  const validateClubName = async ({
    clubName,
    currentClubId,
  }: ValidateClubNameInput): Promise<ValidateClubNameResult> => {
    // Validate input - empty or whitespace-only names are not available
    if (!clubName || !clubName.trim()) {
      return { isAvailable: false };
    }

    const searchName = clubName.trim().toLowerCase();

    const { listClubs } = await amplify.request<{
      listClubs: { items: Array<{ id: string; clubName: string }> };
    }>(ListClubsBySearchName, {
      filter: {
        searchName: {
          eq: searchName,
        },
      },
    });

    // If no clubs found, name is available
    if (!listClubs.items || listClubs.items.length === 0) {
      return { isAvailable: true };
    }

    // If found club is the current club being edited, name is available
    const existingClub = listClubs.items[0];
    if (currentClubId && existingClub.id === currentClubId) {
      return { isAvailable: true };
    }

    // Name is taken by another club
    return {
      isAvailable: false,
      existingClubId: existingClub.id,
    };
  };

  return { validateClubName };
}

export { useValidateClubName };
export type { ValidateClubNameInput, ValidateClubNameResult };
