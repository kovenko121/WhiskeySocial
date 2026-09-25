/**
 * GraphQL queries for CMSUserBrand
 * Used to fetch brand associations for CMS users
 */

export const LIST_CMS_USER_BRANDS_BY_CMS_USER_ID = `
  query ListCMSUserBrandsByCmsUserId($cmsUserId: ID!) {
    listCMSUserBrands(filter: { cmsUserId: { eq: $cmsUserId } }, limit: 2000) {
      items {
        id
        cmsUserId
        brandUserId
        assignedAt
        assignedBy
        createdAt
        updatedAt
        brandUser {
          id
          username
          bio
          brandName
          brandSearchName
        }
      }
      nextToken
    }
  }
`;

export const GET_CMS_USER_BRAND = `
  query GetCMSUserBrand($id: ID!) {
    getCMSUserBrand(id: $id) {
      id
      cmsUserId
      brandUserId
      assignedAt
      assignedBy
      createdAt
      updatedAt
      cmsUser {
        id
        email
        role
        isActive
      }
      brandUser {
        id
        username
        bio
        brandName
        brandSearchName
      }
    }
  }
`;

export const LIST_ALL_CMS_USER_BRANDS = `
  query ListAllCMSUserBrands($nextToken: String) {
    listCMSUserBrands(limit: 2000, nextToken: $nextToken) {
      items {
        id
        cmsUserId
        brandUserId
        assignedAt
        assignedBy
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;