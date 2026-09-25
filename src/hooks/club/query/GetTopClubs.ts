export const GetTopClubs = /* GraphQL */ `
  query SearchClubs(
    $filter: SearchableClubFilterInput
    $sort: [SearchableClubSortInput]
    $limit: Int
    $nextToken: String
  ) {
    searchClubs(filter: $filter, sort: $sort, limit: $limit, nextToken: $nextToken) {
      items {
        id
        clubName
        clubDetails
        profilePicture
        coverPhoto
        isPrivate
        memberCount
        whiskeyCount
        createdAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
