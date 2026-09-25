export const createClubRequestMutation = /* GraphQL */ `
  mutation CreateClubRequest(
    $input: CreateClubRequestInput!
    $condition: ModelClubRequestConditionInput
  ) {
    createClubRequest(input: $input, condition: $condition) {
      id
      clubName
      description
      location
      currentMemberCount
      isPrivate
      requestedBy
      status
      createdAt
      updatedAt
      reviewedBy
      reviewedAt
      rejectionReason
      createdClubId
      __typename
    }
  }
`;
