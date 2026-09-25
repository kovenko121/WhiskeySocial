import { gql } from 'graphql-request';

const GetClub = gql`
  query GetClub($id: ID!) {
    getClub(id: $id) {
      id
      clubName
      searchName
      clubDetails
      coverPhoto
      profilePicture
      isPrivate
      createdBy
      createdAt
      updatedAt
      pinnedPostId
      memberCount
      whiskeyCount
      __typename
    }
  }
`;

export { GetClub };
