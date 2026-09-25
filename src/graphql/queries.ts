/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../types/api";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const findVenues = /* GraphQL */ `query FindVenues($input: FindVenuesInput!) {
  findVenues(input: $input) {
    items {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    total
    __typename
  }
}
` as GeneratedQuery<
  APITypes.FindVenuesQueryVariables,
  APITypes.FindVenuesQuery
>;
export const findWhiskeys = /* GraphQL */ `query FindWhiskeys($input: FindWhiskeysInput!) {
  findWhiskeys(input: $input) {
    items {
      userId
      whiskeyId
      whiskeyFullName
      proof
      proofType
      warehouse
      purchaseYear
      batch
      rick
      barrel
      bottle
      notes
      singleBarrel
      storePick
      age
      style
      whiskeyType
      archived
      id
      createdAt
      updatedAt
      userWhiskeysId
      whiskeyUsersId
      owner
      __typename
    }
    nextToken
    total
    __typename
  }
}
` as GeneratedQuery<
  APITypes.FindWhiskeysQueryVariables,
  APITypes.FindWhiskeysQuery
>;
export const getUser = /* GraphQL */ `query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    personFirstName
    personLastName
    personFullName
    venueName
    venueSearchName
    venuePhone
    venueAddressCountry
    venueAddressCity
    venueAddressStreet
    venueAddressNumber
    venueAddressState
    venueAddressGeo {
      lat
      lon
      __typename
    }
    venueCalculatedRating
    venueMenu {
      bucket
      key
      region
      __typename
    }
    venueCheckinsCount
    venueWebsite
    venueHours
    brandName
    brandSearchName
    brandDescription
    brandLogo {
      bucket
      key
      region
      __typename
    }
    brandCoverImage {
      bucket
      key
      region
      __typename
    }
    brandWebsite
    brandCountry
    brandFoundedYear
    brandStory
    userType
    username
    profilePicture {
      bucket
      key
      region
      __typename
    }
    profilePictureKey
    profilePictureModerationStatus
    coverPicture {
      bucket
      key
      region
      __typename
    }
    coverPictureKey
    coverPictureModerationStatus
    bio
    notificationSettings {
      name
      description
      value
      __typename
    }
    securitySettings {
      name
      description
      value
      __typename
    }
    deleted
    archived
    isMyCollectionPublic
    whiskeys {
      nextToken
      __typename
    }
    reviews {
      nextToken
      __typename
    }
    likedPosts {
      nextToken
      __typename
    }
    posts {
      nextToken
      __typename
    }
    comments {
      nextToken
      __typename
    }
    wishList {
      nextToken
      __typename
    }
    trendingWhiskeys {
      nextToken
      __typename
    }
    followers
    following
    expoTokens
    relatedNotifications {
      nextToken
      __typename
    }
    reports {
      nextToken
      __typename
    }
    rewards {
      nextToken
      __typename
    }
    isOnRewards
    favoriteGuides {
      nextToken
      __typename
    }
    myPours {
      nextToken
      __typename
    }
    brandWhiskeys {
      nextToken
      __typename
    }
    cmsUsers {
      nextToken
      __typename
    }
    blockedUsers
    toBeRedeemed
    externalId
    clubMembers {
      nextToken
      __typename
    }
    clubRequestsCreated {
      nextToken
      __typename
    }
    dmPrivacySetting
    conversationParticipants {
      nextToken
      __typename
    }
    messages {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<APITypes.GetUserQueryVariables, APITypes.GetUserQuery>;
export const listUsers = /* GraphQL */ `query ListUsers(
  $filter: ModelUserFilterInput
  $limit: Int
  $nextToken: String
) {
  listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListUsersQueryVariables, APITypes.ListUsersQuery>;
export const usersByUsername = /* GraphQL */ `query UsersByUsername(
  $username: String!
  $sortDirection: ModelSortDirection
  $filter: ModelUserFilterInput
  $limit: Int
  $nextToken: String
) {
  usersByUsername(
    username: $username
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UsersByUsernameQueryVariables,
  APITypes.UsersByUsernameQuery
>;
export const usersByProfilePictureKey = /* GraphQL */ `query UsersByProfilePictureKey(
  $profilePictureKey: String!
  $sortDirection: ModelSortDirection
  $filter: ModelUserFilterInput
  $limit: Int
  $nextToken: String
) {
  usersByProfilePictureKey(
    profilePictureKey: $profilePictureKey
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UsersByProfilePictureKeyQueryVariables,
  APITypes.UsersByProfilePictureKeyQuery
>;
export const usersByCoverPictureKey = /* GraphQL */ `query UsersByCoverPictureKey(
  $coverPictureKey: String!
  $sortDirection: ModelSortDirection
  $filter: ModelUserFilterInput
  $limit: Int
  $nextToken: String
) {
  usersByCoverPictureKey(
    coverPictureKey: $coverPictureKey
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UsersByCoverPictureKeyQueryVariables,
  APITypes.UsersByCoverPictureKeyQuery
>;
export const searchUsers = /* GraphQL */ `query SearchUsers(
  $filter: SearchableUserFilterInput
  $sort: [SearchableUserSortInput]
  $limit: Int
  $nextToken: String
  $from: Int
  $aggregates: [SearchableUserAggregationInput]
) {
  searchUsers(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
    from: $from
    aggregates: $aggregates
  ) {
    items {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    total
    aggregateItems {
      name
      result {
        ... on SearchableAggregateScalarResult {
          value
        }
        ... on SearchableAggregateBucketResult {
          buckets {
            key
            doc_count
            __typename
          }
        }
      }
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SearchUsersQueryVariables,
  APITypes.SearchUsersQuery
>;
export const getUserPours = /* GraphQL */ `query GetUserPours($id: ID!) {
  getUserPours(id: $id) {
    userId
    user {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    whiskeyFullName
    count
    whiskeyId
    whiskey {
      id
      name
      description
      type
      brandId
      brand
      age
      calculatedRating
      distillery
      origin
      proof
      proofType
      batch
      rick
      barrel
      bottle
      storePick
      fullName
      distilleryTastingNotes
      specialistChoice
      starterPick
      singleBarrel
      createdAt
      updatedAt
      userBrandWhiskeysId
      __typename
    }
    id
    createdAt
    updatedAt
    userMyPoursId
    whiskeyUserPoursId
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserPoursQueryVariables,
  APITypes.GetUserPoursQuery
>;
export const listUserPours = /* GraphQL */ `query ListUserPours(
  $filter: ModelUserPoursFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserPours(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      userId
      whiskeyFullName
      count
      whiskeyId
      id
      createdAt
      updatedAt
      userMyPoursId
      whiskeyUserPoursId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserPoursQueryVariables,
  APITypes.ListUserPoursQuery
>;
export const userPoursByUserIdAndWhiskeyFullName = /* GraphQL */ `query UserPoursByUserIdAndWhiskeyFullName(
  $userId: ID!
  $whiskeyFullName: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelUserPoursFilterInput
  $limit: Int
  $nextToken: String
) {
  userPoursByUserIdAndWhiskeyFullName(
    userId: $userId
    whiskeyFullName: $whiskeyFullName
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      userId
      whiskeyFullName
      count
      whiskeyId
      id
      createdAt
      updatedAt
      userMyPoursId
      whiskeyUserPoursId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserPoursByUserIdAndWhiskeyFullNameQueryVariables,
  APITypes.UserPoursByUserIdAndWhiskeyFullNameQuery
>;
export const userPoursByWhiskeyId = /* GraphQL */ `query UserPoursByWhiskeyId(
  $whiskeyId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelUserPoursFilterInput
  $limit: Int
  $nextToken: String
) {
  userPoursByWhiskeyId(
    whiskeyId: $whiskeyId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      userId
      whiskeyFullName
      count
      whiskeyId
      id
      createdAt
      updatedAt
      userMyPoursId
      whiskeyUserPoursId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserPoursByWhiskeyIdQueryVariables,
  APITypes.UserPoursByWhiskeyIdQuery
>;
export const searchUserPours = /* GraphQL */ `query SearchUserPours(
  $filter: SearchableUserPoursFilterInput
  $sort: [SearchableUserPoursSortInput]
  $limit: Int
  $nextToken: String
  $from: Int
  $aggregates: [SearchableUserPoursAggregationInput]
) {
  searchUserPours(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
    from: $from
    aggregates: $aggregates
  ) {
    items {
      userId
      whiskeyFullName
      count
      whiskeyId
      id
      createdAt
      updatedAt
      userMyPoursId
      whiskeyUserPoursId
      owner
      __typename
    }
    nextToken
    total
    aggregateItems {
      name
      result {
        ... on SearchableAggregateScalarResult {
          value
        }
        ... on SearchableAggregateBucketResult {
          buckets {
            key
            doc_count
            __typename
          }
        }
      }
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SearchUserPoursQueryVariables,
  APITypes.SearchUserPoursQuery
>;
export const getVenueRequest = /* GraphQL */ `query GetVenueRequest($id: ID!) {
  getVenueRequest(id: $id) {
    id
    fullName
    email
    venuePhone
    userId
    venueId
    venueName
    username
    venueAddressCountry
    venueAddressCity
    venueAddressStreet
    venueAddressNumber
    venueAddressState
    venueWebsite
    status
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetVenueRequestQueryVariables,
  APITypes.GetVenueRequestQuery
>;
export const listVenueRequests = /* GraphQL */ `query ListVenueRequests(
  $filter: ModelVenueRequestFilterInput
  $limit: Int
  $nextToken: String
) {
  listVenueRequests(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      fullName
      email
      venuePhone
      userId
      venueId
      venueName
      username
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueWebsite
      status
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListVenueRequestsQueryVariables,
  APITypes.ListVenueRequestsQuery
>;
export const getUserWhiskeys = /* GraphQL */ `query GetUserWhiskeys($id: ID!) {
  getUserWhiskeys(id: $id) {
    userId
    user {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    whiskeyId
    whiskeyFullName
    whiskey {
      id
      name
      description
      type
      brandId
      brand
      age
      calculatedRating
      distillery
      origin
      proof
      proofType
      batch
      rick
      barrel
      bottle
      storePick
      fullName
      distilleryTastingNotes
      specialistChoice
      starterPick
      singleBarrel
      createdAt
      updatedAt
      userBrandWhiskeysId
      __typename
    }
    geo {
      lat
      lon
      __typename
    }
    proof
    proofType
    warehouse
    purchaseYear
    batch
    rick
    barrel
    bottle
    notes
    singleBarrel
    storePick
    age
    style
    whiskeyType
    archived
    id
    createdAt
    updatedAt
    userWhiskeysId
    whiskeyUsersId
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserWhiskeysQueryVariables,
  APITypes.GetUserWhiskeysQuery
>;
export const listUserWhiskeys = /* GraphQL */ `query ListUserWhiskeys(
  $filter: ModelUserWhiskeysFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserWhiskeys(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      userId
      whiskeyId
      whiskeyFullName
      proof
      proofType
      warehouse
      purchaseYear
      batch
      rick
      barrel
      bottle
      notes
      singleBarrel
      storePick
      age
      style
      whiskeyType
      archived
      id
      createdAt
      updatedAt
      userWhiskeysId
      whiskeyUsersId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserWhiskeysQueryVariables,
  APITypes.ListUserWhiskeysQuery
>;
export const userWhiskeysByUserId = /* GraphQL */ `query UserWhiskeysByUserId(
  $userId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelUserWhiskeysFilterInput
  $limit: Int
  $nextToken: String
) {
  userWhiskeysByUserId(
    userId: $userId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      userId
      whiskeyId
      whiskeyFullName
      proof
      proofType
      warehouse
      purchaseYear
      batch
      rick
      barrel
      bottle
      notes
      singleBarrel
      storePick
      age
      style
      whiskeyType
      archived
      id
      createdAt
      updatedAt
      userWhiskeysId
      whiskeyUsersId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserWhiskeysByUserIdQueryVariables,
  APITypes.UserWhiskeysByUserIdQuery
>;
export const userWhiskeysByWhiskeyId = /* GraphQL */ `query UserWhiskeysByWhiskeyId(
  $whiskeyId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelUserWhiskeysFilterInput
  $limit: Int
  $nextToken: String
) {
  userWhiskeysByWhiskeyId(
    whiskeyId: $whiskeyId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      userId
      whiskeyId
      whiskeyFullName
      proof
      proofType
      warehouse
      purchaseYear
      batch
      rick
      barrel
      bottle
      notes
      singleBarrel
      storePick
      age
      style
      whiskeyType
      archived
      id
      createdAt
      updatedAt
      userWhiskeysId
      whiskeyUsersId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserWhiskeysByWhiskeyIdQueryVariables,
  APITypes.UserWhiskeysByWhiskeyIdQuery
>;
export const searchUserWhiskeys = /* GraphQL */ `query SearchUserWhiskeys(
  $filter: SearchableUserWhiskeysFilterInput
  $sort: [SearchableUserWhiskeysSortInput]
  $limit: Int
  $nextToken: String
  $from: Int
  $aggregates: [SearchableUserWhiskeysAggregationInput]
) {
  searchUserWhiskeys(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
    from: $from
    aggregates: $aggregates
  ) {
    items {
      userId
      whiskeyId
      whiskeyFullName
      proof
      proofType
      warehouse
      purchaseYear
      batch
      rick
      barrel
      bottle
      notes
      singleBarrel
      storePick
      age
      style
      whiskeyType
      archived
      id
      createdAt
      updatedAt
      userWhiskeysId
      whiskeyUsersId
      owner
      __typename
    }
    nextToken
    total
    aggregateItems {
      name
      result {
        ... on SearchableAggregateScalarResult {
          value
        }
        ... on SearchableAggregateBucketResult {
          buckets {
            key
            doc_count
            __typename
          }
        }
      }
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SearchUserWhiskeysQueryVariables,
  APITypes.SearchUserWhiskeysQuery
>;
export const getUserTrendingWhiskeys = /* GraphQL */ `query GetUserTrendingWhiskeys($id: ID!) {
  getUserTrendingWhiskeys(id: $id) {
    userId
    user {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    whiskeyId
    whiskey {
      id
      name
      description
      type
      brandId
      brand
      age
      calculatedRating
      distillery
      origin
      proof
      proofType
      batch
      rick
      barrel
      bottle
      storePick
      fullName
      distilleryTastingNotes
      specialistChoice
      starterPick
      singleBarrel
      createdAt
      updatedAt
      userBrandWhiskeysId
      __typename
    }
    count
    id
    createdAt
    updatedAt
    userTrendingWhiskeysId
    whiskeyUserTrendingWhiskeysId
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserTrendingWhiskeysQueryVariables,
  APITypes.GetUserTrendingWhiskeysQuery
>;
export const listUserTrendingWhiskeys = /* GraphQL */ `query ListUserTrendingWhiskeys(
  $filter: ModelUserTrendingWhiskeysFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserTrendingWhiskeys(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      userId
      whiskeyId
      count
      id
      createdAt
      updatedAt
      userTrendingWhiskeysId
      whiskeyUserTrendingWhiskeysId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserTrendingWhiskeysQueryVariables,
  APITypes.ListUserTrendingWhiskeysQuery
>;
export const userTrendingWhiskeysByUserIdAndCount = /* GraphQL */ `query UserTrendingWhiskeysByUserIdAndCount(
  $userId: ID!
  $count: ModelIntKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelUserTrendingWhiskeysFilterInput
  $limit: Int
  $nextToken: String
) {
  userTrendingWhiskeysByUserIdAndCount(
    userId: $userId
    count: $count
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      userId
      whiskeyId
      count
      id
      createdAt
      updatedAt
      userTrendingWhiskeysId
      whiskeyUserTrendingWhiskeysId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserTrendingWhiskeysByUserIdAndCountQueryVariables,
  APITypes.UserTrendingWhiskeysByUserIdAndCountQuery
>;
export const userTrendingWhiskeysByWhiskeyIdAndCount = /* GraphQL */ `query UserTrendingWhiskeysByWhiskeyIdAndCount(
  $whiskeyId: ID!
  $count: ModelIntKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelUserTrendingWhiskeysFilterInput
  $limit: Int
  $nextToken: String
) {
  userTrendingWhiskeysByWhiskeyIdAndCount(
    whiskeyId: $whiskeyId
    count: $count
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      userId
      whiskeyId
      count
      id
      createdAt
      updatedAt
      userTrendingWhiskeysId
      whiskeyUserTrendingWhiskeysId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserTrendingWhiskeysByWhiskeyIdAndCountQueryVariables,
  APITypes.UserTrendingWhiskeysByWhiskeyIdAndCountQuery
>;
export const getWhiskey = /* GraphQL */ `query GetWhiskey($id: ID!) {
  getWhiskey(id: $id) {
    id
    name
    description
    type
    picture {
      bucket
      key
      region
      __typename
    }
    brandId
    brandUser {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    brand
    brandPicture {
      bucket
      key
      region
      __typename
    }
    age
    calculatedRating
    awards {
      title
      year
      __typename
    }
    users {
      nextToken
      __typename
    }
    usersWhishList {
      nextToken
      __typename
    }
    userTrendingWhiskeys {
      nextToken
      __typename
    }
    reviews {
      nextToken
      __typename
    }
    userPours {
      nextToken
      __typename
    }
    distillery
    origin
    proof
    proofType
    batch
    rick
    barrel
    bottle
    storePick
    fullName
    distilleryTastingNotes
    specialistChoice
    starterPick
    singleBarrel
    clubWhiskeys {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    userBrandWhiskeysId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetWhiskeyQueryVariables,
  APITypes.GetWhiskeyQuery
>;
export const listWhiskeys = /* GraphQL */ `query ListWhiskeys(
  $filter: ModelWhiskeyFilterInput
  $limit: Int
  $nextToken: String
) {
  listWhiskeys(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      description
      type
      brandId
      brand
      age
      calculatedRating
      distillery
      origin
      proof
      proofType
      batch
      rick
      barrel
      bottle
      storePick
      fullName
      distilleryTastingNotes
      specialistChoice
      starterPick
      singleBarrel
      createdAt
      updatedAt
      userBrandWhiskeysId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListWhiskeysQueryVariables,
  APITypes.ListWhiskeysQuery
>;
export const whiskeysByName = /* GraphQL */ `query WhiskeysByName(
  $name: String!
  $sortDirection: ModelSortDirection
  $filter: ModelWhiskeyFilterInput
  $limit: Int
  $nextToken: String
) {
  whiskeysByName(
    name: $name
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      name
      description
      type
      brandId
      brand
      age
      calculatedRating
      distillery
      origin
      proof
      proofType
      batch
      rick
      barrel
      bottle
      storePick
      fullName
      distilleryTastingNotes
      specialistChoice
      starterPick
      singleBarrel
      createdAt
      updatedAt
      userBrandWhiskeysId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.WhiskeysByNameQueryVariables,
  APITypes.WhiskeysByNameQuery
>;
export const whiskeysByBrandId = /* GraphQL */ `query WhiskeysByBrandId(
  $brandId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelWhiskeyFilterInput
  $limit: Int
  $nextToken: String
) {
  whiskeysByBrandId(
    brandId: $brandId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      name
      description
      type
      brandId
      brand
      age
      calculatedRating
      distillery
      origin
      proof
      proofType
      batch
      rick
      barrel
      bottle
      storePick
      fullName
      distilleryTastingNotes
      specialistChoice
      starterPick
      singleBarrel
      createdAt
      updatedAt
      userBrandWhiskeysId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.WhiskeysByBrandIdQueryVariables,
  APITypes.WhiskeysByBrandIdQuery
>;
export const whiskeysByBrand = /* GraphQL */ `query WhiskeysByBrand(
  $brand: String!
  $sortDirection: ModelSortDirection
  $filter: ModelWhiskeyFilterInput
  $limit: Int
  $nextToken: String
) {
  whiskeysByBrand(
    brand: $brand
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      name
      description
      type
      brandId
      brand
      age
      calculatedRating
      distillery
      origin
      proof
      proofType
      batch
      rick
      barrel
      bottle
      storePick
      fullName
      distilleryTastingNotes
      specialistChoice
      starterPick
      singleBarrel
      createdAt
      updatedAt
      userBrandWhiskeysId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.WhiskeysByBrandQueryVariables,
  APITypes.WhiskeysByBrandQuery
>;
export const searchWhiskeys = /* GraphQL */ `query SearchWhiskeys(
  $filter: SearchableWhiskeyFilterInput
  $sort: [SearchableWhiskeySortInput]
  $limit: Int
  $nextToken: String
  $from: Int
  $aggregates: [SearchableWhiskeyAggregationInput]
) {
  searchWhiskeys(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
    from: $from
    aggregates: $aggregates
  ) {
    items {
      id
      name
      description
      type
      brandId
      brand
      age
      calculatedRating
      distillery
      origin
      proof
      proofType
      batch
      rick
      barrel
      bottle
      storePick
      fullName
      distilleryTastingNotes
      specialistChoice
      starterPick
      singleBarrel
      createdAt
      updatedAt
      userBrandWhiskeysId
      __typename
    }
    nextToken
    total
    aggregateItems {
      name
      result {
        ... on SearchableAggregateScalarResult {
          value
        }
        ... on SearchableAggregateBucketResult {
          buckets {
            key
            doc_count
            __typename
          }
        }
      }
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SearchWhiskeysQueryVariables,
  APITypes.SearchWhiskeysQuery
>;
export const getFeatureFlags = /* GraphQL */ `query GetFeatureFlags($id: ID!) {
  getFeatureFlags(id: $id) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetFeatureFlagsQueryVariables,
  APITypes.GetFeatureFlagsQuery
>;
export const listFeatureFlags = /* GraphQL */ `query ListFeatureFlags(
  $filter: ModelFeatureFlagsFilterInput
  $limit: Int
  $nextToken: String
) {
  listFeatureFlags(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      key
      value
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListFeatureFlagsQueryVariables,
  APITypes.ListFeatureFlagsQuery
>;
export const getAppConfig = /* GraphQL */ `query GetAppConfig($id: ID!) {
  getAppConfig(id: $id) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAppConfigQueryVariables,
  APITypes.GetAppConfigQuery
>;
export const listAppConfigs = /* GraphQL */ `query ListAppConfigs(
  $filter: ModelAppConfigFilterInput
  $limit: Int
  $nextToken: String
) {
  listAppConfigs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      key
      value
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAppConfigsQueryVariables,
  APITypes.ListAppConfigsQuery
>;
export const getReward = /* GraphQL */ `query GetReward($id: ID!) {
  getReward(id: $id) {
    id
    title
    description
    photo {
      bucket
      key
      region
      __typename
    }
    isAvailable
    sizes
    models
    conditions {
      key
      value
      __typename
    }
    users {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetRewardQueryVariables, APITypes.GetRewardQuery>;
export const listRewards = /* GraphQL */ `query ListRewards(
  $filter: ModelRewardFilterInput
  $limit: Int
  $nextToken: String
) {
  listRewards(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      description
      isAvailable
      sizes
      models
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListRewardsQueryVariables,
  APITypes.ListRewardsQuery
>;
export const getGuideTags = /* GraphQL */ `query GetGuideTags($id: ID!) {
  getGuideTags(id: $id) {
    id
    name
    count
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetGuideTagsQueryVariables,
  APITypes.GetGuideTagsQuery
>;
export const listGuideTags = /* GraphQL */ `query ListGuideTags(
  $filter: ModelGuideTagsFilterInput
  $limit: Int
  $nextToken: String
) {
  listGuideTags(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      count
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListGuideTagsQueryVariables,
  APITypes.ListGuideTagsQuery
>;
export const getGuides = /* GraphQL */ `query GetGuides($id: ID!) {
  getGuides(id: $id) {
    id
    title
    subtitle
    coverPhoto {
      bucket
      key
      region
      __typename
    }
    tag
    body
    photos {
      bucket
      key
      region
      __typename
    }
    users {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetGuidesQueryVariables, APITypes.GetGuidesQuery>;
export const listGuides = /* GraphQL */ `query ListGuides(
  $filter: ModelGuidesFilterInput
  $limit: Int
  $nextToken: String
) {
  listGuides(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      subtitle
      tag
      body
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListGuidesQueryVariables,
  APITypes.ListGuidesQuery
>;
export const searchGuides = /* GraphQL */ `query SearchGuides(
  $filter: SearchableGuidesFilterInput
  $sort: [SearchableGuidesSortInput]
  $limit: Int
  $nextToken: String
  $from: Int
  $aggregates: [SearchableGuidesAggregationInput]
) {
  searchGuides(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
    from: $from
    aggregates: $aggregates
  ) {
    items {
      id
      title
      subtitle
      tag
      body
      createdAt
      updatedAt
      __typename
    }
    nextToken
    total
    aggregateItems {
      name
      result {
        ... on SearchableAggregateScalarResult {
          value
        }
        ... on SearchableAggregateBucketResult {
          buckets {
            key
            doc_count
            __typename
          }
        }
      }
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SearchGuidesQueryVariables,
  APITypes.SearchGuidesQuery
>;
export const getUserReward = /* GraphQL */ `query GetUserReward($id: ID!) {
  getUserReward(id: $id) {
    id
    userId
    user {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    rewardId
    reward {
      id
      title
      description
      isAvailable
      sizes
      models
      createdAt
      updatedAt
      __typename
    }
    score
    lastScoreUpdate
    isAlreadyViewed
    isRedeemed
    isCompleted
    trackingCode
    service
    size
    model
    fullName
    email
    address
    city
    state
    zipcode
    createdAt
    updatedAt
    userRewardsId
    rewardUsersId
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserRewardQueryVariables,
  APITypes.GetUserRewardQuery
>;
export const listUserRewards = /* GraphQL */ `query ListUserRewards(
  $filter: ModelUserRewardFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserRewards(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      rewardId
      score
      lastScoreUpdate
      isAlreadyViewed
      isRedeemed
      isCompleted
      trackingCode
      service
      size
      model
      fullName
      email
      address
      city
      state
      zipcode
      createdAt
      updatedAt
      userRewardsId
      rewardUsersId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserRewardsQueryVariables,
  APITypes.ListUserRewardsQuery
>;
export const userRewardsByUserId = /* GraphQL */ `query UserRewardsByUserId(
  $userId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelUserRewardFilterInput
  $limit: Int
  $nextToken: String
) {
  userRewardsByUserId(
    userId: $userId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      rewardId
      score
      lastScoreUpdate
      isAlreadyViewed
      isRedeemed
      isCompleted
      trackingCode
      service
      size
      model
      fullName
      email
      address
      city
      state
      zipcode
      createdAt
      updatedAt
      userRewardsId
      rewardUsersId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserRewardsByUserIdQueryVariables,
  APITypes.UserRewardsByUserIdQuery
>;
export const userRewardsByRewardId = /* GraphQL */ `query UserRewardsByRewardId(
  $rewardId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelUserRewardFilterInput
  $limit: Int
  $nextToken: String
) {
  userRewardsByRewardId(
    rewardId: $rewardId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      rewardId
      score
      lastScoreUpdate
      isAlreadyViewed
      isRedeemed
      isCompleted
      trackingCode
      service
      size
      model
      fullName
      email
      address
      city
      state
      zipcode
      createdAt
      updatedAt
      userRewardsId
      rewardUsersId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserRewardsByRewardIdQueryVariables,
  APITypes.UserRewardsByRewardIdQuery
>;
export const getReview = /* GraphQL */ `query GetReview($id: ID!) {
  getReview(id: $id) {
    id
    title
    description
    rating
    recommendationTags
    whiskey {
      id
      name
      description
      type
      brandId
      brand
      age
      calculatedRating
      distillery
      origin
      proof
      proofType
      batch
      rick
      barrel
      bottle
      storePick
      fullName
      distilleryTastingNotes
      specialistChoice
      starterPick
      singleBarrel
      createdAt
      updatedAt
      userBrandWhiskeysId
      __typename
    }
    whiskeyId
    userId
    user {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    specialistReview
    specialistName
    specialistImage {
      bucket
      key
      region
      __typename
    }
    createdAt
    updatedAt
    userReviewsId
    whiskeyReviewsId
    owner
    __typename
  }
}
` as GeneratedQuery<APITypes.GetReviewQueryVariables, APITypes.GetReviewQuery>;
export const listReviews = /* GraphQL */ `query ListReviews(
  $filter: ModelReviewFilterInput
  $limit: Int
  $nextToken: String
) {
  listReviews(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      description
      rating
      recommendationTags
      whiskeyId
      userId
      specialistReview
      specialistName
      createdAt
      updatedAt
      userReviewsId
      whiskeyReviewsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListReviewsQueryVariables,
  APITypes.ListReviewsQuery
>;
export const reviewsByWhiskeyIdAndSpecialistReviewAndRating = /* GraphQL */ `query ReviewsByWhiskeyIdAndSpecialistReviewAndRating(
  $whiskeyId: ID!
  $specialistReviewRating: ModelReviewByWhiskeyCompositeKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelReviewFilterInput
  $limit: Int
  $nextToken: String
) {
  reviewsByWhiskeyIdAndSpecialistReviewAndRating(
    whiskeyId: $whiskeyId
    specialistReviewRating: $specialistReviewRating
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      title
      description
      rating
      recommendationTags
      whiskeyId
      userId
      specialistReview
      specialistName
      createdAt
      updatedAt
      userReviewsId
      whiskeyReviewsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ReviewsByWhiskeyIdAndSpecialistReviewAndRatingQueryVariables,
  APITypes.ReviewsByWhiskeyIdAndSpecialistReviewAndRatingQuery
>;
export const reviewsByUserId = /* GraphQL */ `query ReviewsByUserId(
  $userId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelReviewFilterInput
  $limit: Int
  $nextToken: String
) {
  reviewsByUserId(
    userId: $userId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      title
      description
      rating
      recommendationTags
      whiskeyId
      userId
      specialistReview
      specialistName
      createdAt
      updatedAt
      userReviewsId
      whiskeyReviewsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ReviewsByUserIdQueryVariables,
  APITypes.ReviewsByUserIdQuery
>;
export const reviewsByUserIdAndWhiskeyId = /* GraphQL */ `query ReviewsByUserIdAndWhiskeyId(
  $userId: ID!
  $whiskeyId: ModelIDKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelReviewFilterInput
  $limit: Int
  $nextToken: String
) {
  reviewsByUserIdAndWhiskeyId(
    userId: $userId
    whiskeyId: $whiskeyId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      title
      description
      rating
      recommendationTags
      whiskeyId
      userId
      specialistReview
      specialistName
      createdAt
      updatedAt
      userReviewsId
      whiskeyReviewsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ReviewsByUserIdAndWhiskeyIdQueryVariables,
  APITypes.ReviewsByUserIdAndWhiskeyIdQuery
>;
export const getSuggestion = /* GraphQL */ `query GetSuggestion($id: ID!) {
  getSuggestion(id: $id) {
    barcode
    name
    brand
    year
    photo {
      bucket
      key
      region
      __typename
    }
    userId
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetSuggestionQueryVariables,
  APITypes.GetSuggestionQuery
>;
export const listSuggestions = /* GraphQL */ `query ListSuggestions(
  $filter: ModelSuggestionFilterInput
  $limit: Int
  $nextToken: String
) {
  listSuggestions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      barcode
      name
      brand
      year
      userId
      id
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSuggestionsQueryVariables,
  APITypes.ListSuggestionsQuery
>;
export const getComment = /* GraphQL */ `query GetComment($id: ID!) {
  getComment(id: $id) {
    id
    text
    authorId
    author {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    postId
    post {
      id
      description
      authorId
      locationId
      photoKey
      photoModerationStatus
      photoKeys
      likesCount
      title
      sharedPostId
      shareComment
      sharesCount
      createdAt
      clubId
      clubIsPrivate
      updatedAt
      userPostsId
      postSharesId
      clubPostsId
      owner
      __typename
    }
    createdAt
    updatedAt
    userCommentsId
    postCommentsId
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCommentQueryVariables,
  APITypes.GetCommentQuery
>;
export const listComments = /* GraphQL */ `query ListComments(
  $filter: ModelCommentFilterInput
  $limit: Int
  $nextToken: String
) {
  listComments(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      text
      authorId
      postId
      createdAt
      updatedAt
      userCommentsId
      postCommentsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCommentsQueryVariables,
  APITypes.ListCommentsQuery
>;
export const commentsByAuthorId = /* GraphQL */ `query CommentsByAuthorId(
  $authorId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelCommentFilterInput
  $limit: Int
  $nextToken: String
) {
  commentsByAuthorId(
    authorId: $authorId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      text
      authorId
      postId
      createdAt
      updatedAt
      userCommentsId
      postCommentsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.CommentsByAuthorIdQueryVariables,
  APITypes.CommentsByAuthorIdQuery
>;
export const commentsByPostId = /* GraphQL */ `query CommentsByPostId(
  $postId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelCommentFilterInput
  $limit: Int
  $nextToken: String
) {
  commentsByPostId(
    postId: $postId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      text
      authorId
      postId
      createdAt
      updatedAt
      userCommentsId
      postCommentsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.CommentsByPostIdQueryVariables,
  APITypes.CommentsByPostIdQuery
>;
export const getPost = /* GraphQL */ `query GetPost($id: ID!) {
  getPost(id: $id) {
    id
    description
    authorId
    locationId
    author {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    photo {
      bucket
      key
      region
      __typename
    }
    photoKey
    photoModerationStatus
    photos {
      bucket
      key
      region
      __typename
    }
    photoKeys
    comments {
      nextToken
      __typename
    }
    likes {
      nextToken
      __typename
    }
    likesCount
    title
    references {
      id
      externalId
      name
      type
      __typename
    }
    inlineTags {
      id
      type
      entityId
      text
      startIndex
      endIndex
      __typename
    }
    sharedPostId
    sharedPost {
      id
      description
      authorId
      locationId
      photoKey
      photoModerationStatus
      photoKeys
      likesCount
      title
      sharedPostId
      shareComment
      sharesCount
      createdAt
      clubId
      clubIsPrivate
      updatedAt
      userPostsId
      postSharesId
      clubPostsId
      owner
      __typename
    }
    shareComment
    sharesCount
    shares {
      nextToken
      __typename
    }
    createdAt
    clubId
    clubIsPrivate
    club {
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
      pinnedBy
      memberCount
      whiskeyCount
      __typename
    }
    updatedAt
    userPostsId
    postSharesId
    clubPostsId
    owner
    __typename
  }
}
` as GeneratedQuery<APITypes.GetPostQueryVariables, APITypes.GetPostQuery>;
export const listPosts = /* GraphQL */ `query ListPosts(
  $filter: ModelPostFilterInput
  $limit: Int
  $nextToken: String
) {
  listPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      description
      authorId
      locationId
      photoKey
      photoModerationStatus
      photoKeys
      likesCount
      title
      sharedPostId
      shareComment
      sharesCount
      createdAt
      clubId
      clubIsPrivate
      updatedAt
      userPostsId
      postSharesId
      clubPostsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListPostsQueryVariables, APITypes.ListPostsQuery>;
export const postsByAuthorIdAndCreatedAt = /* GraphQL */ `query PostsByAuthorIdAndCreatedAt(
  $authorId: ID!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelPostFilterInput
  $limit: Int
  $nextToken: String
) {
  postsByAuthorIdAndCreatedAt(
    authorId: $authorId
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      description
      authorId
      locationId
      photoKey
      photoModerationStatus
      photoKeys
      likesCount
      title
      sharedPostId
      shareComment
      sharesCount
      createdAt
      clubId
      clubIsPrivate
      updatedAt
      userPostsId
      postSharesId
      clubPostsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.PostsByAuthorIdAndCreatedAtQueryVariables,
  APITypes.PostsByAuthorIdAndCreatedAtQuery
>;
export const postsByAuthorIdAndClubId = /* GraphQL */ `query PostsByAuthorIdAndClubId(
  $authorId: ID!
  $clubId: ModelIDKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelPostFilterInput
  $limit: Int
  $nextToken: String
) {
  postsByAuthorIdAndClubId(
    authorId: $authorId
    clubId: $clubId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      description
      authorId
      locationId
      photoKey
      photoModerationStatus
      photoKeys
      likesCount
      title
      sharedPostId
      shareComment
      sharesCount
      createdAt
      clubId
      clubIsPrivate
      updatedAt
      userPostsId
      postSharesId
      clubPostsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.PostsByAuthorIdAndClubIdQueryVariables,
  APITypes.PostsByAuthorIdAndClubIdQuery
>;
export const postsByPhotoKey = /* GraphQL */ `query PostsByPhotoKey(
  $photoKey: String!
  $sortDirection: ModelSortDirection
  $filter: ModelPostFilterInput
  $limit: Int
  $nextToken: String
) {
  postsByPhotoKey(
    photoKey: $photoKey
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      description
      authorId
      locationId
      photoKey
      photoModerationStatus
      photoKeys
      likesCount
      title
      sharedPostId
      shareComment
      sharesCount
      createdAt
      clubId
      clubIsPrivate
      updatedAt
      userPostsId
      postSharesId
      clubPostsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.PostsByPhotoKeyQueryVariables,
  APITypes.PostsByPhotoKeyQuery
>;
export const postsBySharedPostId = /* GraphQL */ `query PostsBySharedPostId(
  $sharedPostId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelPostFilterInput
  $limit: Int
  $nextToken: String
) {
  postsBySharedPostId(
    sharedPostId: $sharedPostId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      description
      authorId
      locationId
      photoKey
      photoModerationStatus
      photoKeys
      likesCount
      title
      sharedPostId
      shareComment
      sharesCount
      createdAt
      clubId
      clubIsPrivate
      updatedAt
      userPostsId
      postSharesId
      clubPostsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.PostsBySharedPostIdQueryVariables,
  APITypes.PostsBySharedPostIdQuery
>;
export const postsByClubIdAndCreatedAt = /* GraphQL */ `query PostsByClubIdAndCreatedAt(
  $clubId: ID!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelPostFilterInput
  $limit: Int
  $nextToken: String
) {
  postsByClubIdAndCreatedAt(
    clubId: $clubId
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      description
      authorId
      locationId
      photoKey
      photoModerationStatus
      photoKeys
      likesCount
      title
      sharedPostId
      shareComment
      sharesCount
      createdAt
      clubId
      clubIsPrivate
      updatedAt
      userPostsId
      postSharesId
      clubPostsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.PostsByClubIdAndCreatedAtQueryVariables,
  APITypes.PostsByClubIdAndCreatedAtQuery
>;
export const searchPosts = /* GraphQL */ `query SearchPosts(
  $filter: SearchablePostFilterInput
  $sort: [SearchablePostSortInput]
  $limit: Int
  $nextToken: String
  $from: Int
  $aggregates: [SearchablePostAggregationInput]
) {
  searchPosts(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
    from: $from
    aggregates: $aggregates
  ) {
    items {
      id
      description
      authorId
      locationId
      photoKey
      photoModerationStatus
      photoKeys
      likesCount
      title
      sharedPostId
      shareComment
      sharesCount
      createdAt
      clubId
      clubIsPrivate
      updatedAt
      userPostsId
      postSharesId
      clubPostsId
      owner
      __typename
    }
    nextToken
    total
    aggregateItems {
      name
      result {
        ... on SearchableAggregateScalarResult {
          value
        }
        ... on SearchableAggregateBucketResult {
          buckets {
            key
            doc_count
            __typename
          }
        }
      }
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SearchPostsQueryVariables,
  APITypes.SearchPostsQuery
>;
export const getNotification = /* GraphQL */ `query GetNotification($id: ID!) {
  getNotification(id: $id) {
    id
    userId
    message
    link
    relatedUserId
    relatedUser {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    primaryPicture {
      bucket
      key
      region
      __typename
    }
    secondaryPicture {
      bucket
      key
      region
      __typename
    }
    type
    createdAt
    updatedAt
    userRelatedNotificationsId
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNotificationQueryVariables,
  APITypes.GetNotificationQuery
>;
export const listNotifications = /* GraphQL */ `query ListNotifications(
  $filter: ModelNotificationFilterInput
  $limit: Int
  $nextToken: String
) {
  listNotifications(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      message
      link
      relatedUserId
      type
      createdAt
      updatedAt
      userRelatedNotificationsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListNotificationsQueryVariables,
  APITypes.ListNotificationsQuery
>;
export const notificationsByUserIdAndCreatedAt = /* GraphQL */ `query NotificationsByUserIdAndCreatedAt(
  $userId: ID!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelNotificationFilterInput
  $limit: Int
  $nextToken: String
) {
  notificationsByUserIdAndCreatedAt(
    userId: $userId
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      message
      link
      relatedUserId
      type
      createdAt
      updatedAt
      userRelatedNotificationsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.NotificationsByUserIdAndCreatedAtQueryVariables,
  APITypes.NotificationsByUserIdAndCreatedAtQuery
>;
export const notificationsByRelatedUserIdAndCreatedAt = /* GraphQL */ `query NotificationsByRelatedUserIdAndCreatedAt(
  $relatedUserId: ID!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelNotificationFilterInput
  $limit: Int
  $nextToken: String
) {
  notificationsByRelatedUserIdAndCreatedAt(
    relatedUserId: $relatedUserId
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      message
      link
      relatedUserId
      type
      createdAt
      updatedAt
      userRelatedNotificationsId
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.NotificationsByRelatedUserIdAndCreatedAtQueryVariables,
  APITypes.NotificationsByRelatedUserIdAndCreatedAtQuery
>;
export const getAdCampaign = /* GraphQL */ `query GetAdCampaign($id: ID!) {
  getAdCampaign(id: $id) {
    id
    name
    startDate
    endDate
    isActive
    owner
    url
    picture {
      bucket
      key
      region
      __typename
    }
    type
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAdCampaignQueryVariables,
  APITypes.GetAdCampaignQuery
>;
export const listAdCampaigns = /* GraphQL */ `query ListAdCampaigns(
  $filter: ModelAdCampaignFilterInput
  $limit: Int
  $nextToken: String
) {
  listAdCampaigns(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      startDate
      endDate
      isActive
      owner
      url
      type
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAdCampaignsQueryVariables,
  APITypes.ListAdCampaignsQuery
>;
export const adCampaignsByType = /* GraphQL */ `query AdCampaignsByType(
  $type: AdType!
  $sortDirection: ModelSortDirection
  $filter: ModelAdCampaignFilterInput
  $limit: Int
  $nextToken: String
) {
  adCampaignsByType(
    type: $type
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      name
      startDate
      endDate
      isActive
      owner
      url
      type
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.AdCampaignsByTypeQueryVariables,
  APITypes.AdCampaignsByTypeQuery
>;
export const getReport = /* GraphQL */ `query GetReport($id: ID!) {
  getReport(id: $id) {
    id
    reason
    description
    reportedUserId
    reportedUser {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    contentId
    contentType
    createdAt
    updatedAt
    userReportsId
    __typename
  }
}
` as GeneratedQuery<APITypes.GetReportQueryVariables, APITypes.GetReportQuery>;
export const listReports = /* GraphQL */ `query ListReports(
  $filter: ModelReportFilterInput
  $limit: Int
  $nextToken: String
) {
  listReports(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      reason
      description
      reportedUserId
      contentId
      contentType
      createdAt
      updatedAt
      userReportsId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListReportsQueryVariables,
  APITypes.ListReportsQuery
>;
export const getEvent = /* GraphQL */ `query GetEvent($id: ID!) {
  getEvent(id: $id) {
    id
    campaign
    interactions
    impressions
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetEventQueryVariables, APITypes.GetEventQuery>;
export const listEvents = /* GraphQL */ `query ListEvents(
  $filter: ModelEventFilterInput
  $limit: Int
  $nextToken: String
) {
  listEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      campaign
      interactions
      impressions
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListEventsQueryVariables,
  APITypes.ListEventsQuery
>;
export const getUpdatePostLikesResult = /* GraphQL */ `query GetUpdatePostLikesResult($id: ID!) {
  getUpdatePostLikesResult(id: $id) {
    success
    message
    postId
    userId
    likeId
    likesCount
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUpdatePostLikesResultQueryVariables,
  APITypes.GetUpdatePostLikesResultQuery
>;
export const listUpdatePostLikesResults = /* GraphQL */ `query ListUpdatePostLikesResults(
  $filter: ModelUpdatePostLikesResultFilterInput
  $limit: Int
  $nextToken: String
) {
  listUpdatePostLikesResults(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      success
      message
      postId
      userId
      likeId
      likesCount
      id
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUpdatePostLikesResultsQueryVariables,
  APITypes.ListUpdatePostLikesResultsQuery
>;
export const getCMSUser = /* GraphQL */ `query GetCMSUser($id: ID!) {
  getCMSUser(id: $id) {
    id
    authId
    email
    role
    brandIds
    brands {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    isActive
    clubRequestsReviewed {
      nextToken
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCMSUserQueryVariables,
  APITypes.GetCMSUserQuery
>;
export const listCMSUsers = /* GraphQL */ `query ListCMSUsers(
  $filter: ModelCMSUserFilterInput
  $limit: Int
  $nextToken: String
) {
  listCMSUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      authId
      email
      role
      brandIds
      createdAt
      updatedAt
      isActive
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCMSUsersQueryVariables,
  APITypes.ListCMSUsersQuery
>;
export const getCMSUserBrand = /* GraphQL */ `query GetCMSUserBrand($id: ID!) {
  getCMSUserBrand(id: $id) {
    id
    cmsUserId
    cmsUser {
      id
      authId
      email
      role
      brandIds
      createdAt
      updatedAt
      isActive
      __typename
    }
    brandUserId
    brandUser {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    assignedAt
    assignedBy
    createdAt
    updatedAt
    userCmsUsersId
    cMSUserBrandsId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCMSUserBrandQueryVariables,
  APITypes.GetCMSUserBrandQuery
>;
export const listCMSUserBrands = /* GraphQL */ `query ListCMSUserBrands(
  $filter: ModelCMSUserBrandFilterInput
  $limit: Int
  $nextToken: String
) {
  listCMSUserBrands(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      cmsUserId
      brandUserId
      assignedAt
      assignedBy
      createdAt
      updatedAt
      userCmsUsersId
      cMSUserBrandsId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCMSUserBrandsQueryVariables,
  APITypes.ListCMSUserBrandsQuery
>;
export const cMSUserBrandsByCmsUserId = /* GraphQL */ `query CMSUserBrandsByCmsUserId(
  $cmsUserId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelCMSUserBrandFilterInput
  $limit: Int
  $nextToken: String
) {
  cMSUserBrandsByCmsUserId(
    cmsUserId: $cmsUserId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      cmsUserId
      brandUserId
      assignedAt
      assignedBy
      createdAt
      updatedAt
      userCmsUsersId
      cMSUserBrandsId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.CMSUserBrandsByCmsUserIdQueryVariables,
  APITypes.CMSUserBrandsByCmsUserIdQuery
>;
export const cMSUserBrandsByBrandUserId = /* GraphQL */ `query CMSUserBrandsByBrandUserId(
  $brandUserId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelCMSUserBrandFilterInput
  $limit: Int
  $nextToken: String
) {
  cMSUserBrandsByBrandUserId(
    brandUserId: $brandUserId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      cmsUserId
      brandUserId
      assignedAt
      assignedBy
      createdAt
      updatedAt
      userCmsUsersId
      cMSUserBrandsId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.CMSUserBrandsByBrandUserIdQueryVariables,
  APITypes.CMSUserBrandsByBrandUserIdQuery
>;
export const getAppVersion = /* GraphQL */ `query GetAppVersion($id: ID!) {
  getAppVersion(id: $id) {
    id
    platform
    currentVersion
    minimumVersion
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAppVersionQueryVariables,
  APITypes.GetAppVersionQuery
>;
export const listAppVersions = /* GraphQL */ `query ListAppVersions(
  $filter: ModelAppVersionFilterInput
  $limit: Int
  $nextToken: String
) {
  listAppVersions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      platform
      currentVersion
      minimumVersion
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAppVersionsQueryVariables,
  APITypes.ListAppVersionsQuery
>;
export const getClub = /* GraphQL */ `query GetClub($id: ID!) {
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
    pinnedBy
    memberCount
    whiskeyCount
    posts {
      nextToken
      __typename
    }
    clubWhiskeys {
      nextToken
      __typename
    }
    clubMembers {
      nextToken
      __typename
    }
    clubRequest {
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
      userClubRequestsCreatedId
      cMSUserClubRequestsReviewedId
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<APITypes.GetClubQueryVariables, APITypes.GetClubQuery>;
export const listClubs = /* GraphQL */ `query ListClubs(
  $filter: ModelClubFilterInput
  $limit: Int
  $nextToken: String
) {
  listClubs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
      pinnedBy
      memberCount
      whiskeyCount
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListClubsQueryVariables, APITypes.ListClubsQuery>;
export const clubsByCreatedByAndCreatedAt = /* GraphQL */ `query ClubsByCreatedByAndCreatedAt(
  $createdBy: ID!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelClubFilterInput
  $limit: Int
  $nextToken: String
) {
  clubsByCreatedByAndCreatedAt(
    createdBy: $createdBy
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
      pinnedBy
      memberCount
      whiskeyCount
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ClubsByCreatedByAndCreatedAtQueryVariables,
  APITypes.ClubsByCreatedByAndCreatedAtQuery
>;
export const searchClubs = /* GraphQL */ `query SearchClubs(
  $filter: SearchableClubFilterInput
  $sort: [SearchableClubSortInput]
  $limit: Int
  $nextToken: String
  $from: Int
  $aggregates: [SearchableClubAggregationInput]
) {
  searchClubs(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
    from: $from
    aggregates: $aggregates
  ) {
    items {
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
      pinnedBy
      memberCount
      whiskeyCount
      __typename
    }
    nextToken
    total
    aggregateItems {
      name
      result {
        ... on SearchableAggregateScalarResult {
          value
        }
        ... on SearchableAggregateBucketResult {
          buckets {
            key
            doc_count
            __typename
          }
        }
      }
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SearchClubsQueryVariables,
  APITypes.SearchClubsQuery
>;
export const getClubMember = /* GraphQL */ `query GetClubMember($id: ID!) {
  getClubMember(id: $id) {
    id
    clubId
    userId
    role
    status
    joinedAt
    requestedAt
    createdAt
    updatedAt
    approvedBy
    promotedBy
    deletionType
    user {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    club {
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
      pinnedBy
      memberCount
      whiskeyCount
      __typename
    }
    userClubMembersId
    clubClubMembersId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetClubMemberQueryVariables,
  APITypes.GetClubMemberQuery
>;
export const listClubMembers = /* GraphQL */ `query ListClubMembers(
  $filter: ModelClubMemberFilterInput
  $limit: Int
  $nextToken: String
) {
  listClubMembers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      clubId
      userId
      role
      status
      joinedAt
      requestedAt
      createdAt
      updatedAt
      approvedBy
      promotedBy
      deletionType
      userClubMembersId
      clubClubMembersId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListClubMembersQueryVariables,
  APITypes.ListClubMembersQuery
>;
export const clubMembersByClubIdAndUserId = /* GraphQL */ `query ClubMembersByClubIdAndUserId(
  $clubId: ID!
  $userId: ModelIDKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelClubMemberFilterInput
  $limit: Int
  $nextToken: String
) {
  clubMembersByClubIdAndUserId(
    clubId: $clubId
    userId: $userId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      clubId
      userId
      role
      status
      joinedAt
      requestedAt
      createdAt
      updatedAt
      approvedBy
      promotedBy
      deletionType
      userClubMembersId
      clubClubMembersId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ClubMembersByClubIdAndUserIdQueryVariables,
  APITypes.ClubMembersByClubIdAndUserIdQuery
>;
export const clubMembersByUserIdAndClubId = /* GraphQL */ `query ClubMembersByUserIdAndClubId(
  $userId: ID!
  $clubId: ModelIDKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelClubMemberFilterInput
  $limit: Int
  $nextToken: String
) {
  clubMembersByUserIdAndClubId(
    userId: $userId
    clubId: $clubId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      clubId
      userId
      role
      status
      joinedAt
      requestedAt
      createdAt
      updatedAt
      approvedBy
      promotedBy
      deletionType
      userClubMembersId
      clubClubMembersId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ClubMembersByUserIdAndClubIdQueryVariables,
  APITypes.ClubMembersByUserIdAndClubIdQuery
>;
export const getClubWhiskey = /* GraphQL */ `query GetClubWhiskey($id: ID!) {
  getClubWhiskey(id: $id) {
    id
    clubId
    whiskeyId
    addedBy
    addedAt
    notes
    createdAt
    updatedAt
    club {
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
      pinnedBy
      memberCount
      whiskeyCount
      __typename
    }
    whiskey {
      id
      name
      description
      type
      brandId
      brand
      age
      calculatedRating
      distillery
      origin
      proof
      proofType
      batch
      rick
      barrel
      bottle
      storePick
      fullName
      distilleryTastingNotes
      specialistChoice
      starterPick
      singleBarrel
      createdAt
      updatedAt
      userBrandWhiskeysId
      __typename
    }
    whiskeyClubWhiskeysId
    clubClubWhiskeysId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetClubWhiskeyQueryVariables,
  APITypes.GetClubWhiskeyQuery
>;
export const listClubWhiskeys = /* GraphQL */ `query ListClubWhiskeys(
  $filter: ModelClubWhiskeyFilterInput
  $limit: Int
  $nextToken: String
) {
  listClubWhiskeys(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      clubId
      whiskeyId
      addedBy
      addedAt
      notes
      createdAt
      updatedAt
      whiskeyClubWhiskeysId
      clubClubWhiskeysId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListClubWhiskeysQueryVariables,
  APITypes.ListClubWhiskeysQuery
>;
export const clubWhiskeysByClubIdAndAddedAt = /* GraphQL */ `query ClubWhiskeysByClubIdAndAddedAt(
  $clubId: ID!
  $addedAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelClubWhiskeyFilterInput
  $limit: Int
  $nextToken: String
) {
  clubWhiskeysByClubIdAndAddedAt(
    clubId: $clubId
    addedAt: $addedAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      clubId
      whiskeyId
      addedBy
      addedAt
      notes
      createdAt
      updatedAt
      whiskeyClubWhiskeysId
      clubClubWhiskeysId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ClubWhiskeysByClubIdAndAddedAtQueryVariables,
  APITypes.ClubWhiskeysByClubIdAndAddedAtQuery
>;
export const clubWhiskeysByWhiskeyIdAndClubId = /* GraphQL */ `query ClubWhiskeysByWhiskeyIdAndClubId(
  $whiskeyId: ID!
  $clubId: ModelIDKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelClubWhiskeyFilterInput
  $limit: Int
  $nextToken: String
) {
  clubWhiskeysByWhiskeyIdAndClubId(
    whiskeyId: $whiskeyId
    clubId: $clubId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      clubId
      whiskeyId
      addedBy
      addedAt
      notes
      createdAt
      updatedAt
      whiskeyClubWhiskeysId
      clubClubWhiskeysId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ClubWhiskeysByWhiskeyIdAndClubIdQueryVariables,
  APITypes.ClubWhiskeysByWhiskeyIdAndClubIdQuery
>;
export const getClubRequest = /* GraphQL */ `query GetClubRequest($id: ID!) {
  getClubRequest(id: $id) {
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
    requestor {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    reviewer {
      id
      authId
      email
      role
      brandIds
      createdAt
      updatedAt
      isActive
      __typename
    }
    createdClub {
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
      pinnedBy
      memberCount
      whiskeyCount
      __typename
    }
    userClubRequestsCreatedId
    cMSUserClubRequestsReviewedId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetClubRequestQueryVariables,
  APITypes.GetClubRequestQuery
>;
export const listClubRequests = /* GraphQL */ `query ListClubRequests(
  $filter: ModelClubRequestFilterInput
  $limit: Int
  $nextToken: String
) {
  listClubRequests(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
      userClubRequestsCreatedId
      cMSUserClubRequestsReviewedId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListClubRequestsQueryVariables,
  APITypes.ListClubRequestsQuery
>;
export const clubRequestsByRequestedByAndCreatedAt = /* GraphQL */ `query ClubRequestsByRequestedByAndCreatedAt(
  $requestedBy: ID!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelClubRequestFilterInput
  $limit: Int
  $nextToken: String
) {
  clubRequestsByRequestedByAndCreatedAt(
    requestedBy: $requestedBy
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
      userClubRequestsCreatedId
      cMSUserClubRequestsReviewedId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ClubRequestsByRequestedByAndCreatedAtQueryVariables,
  APITypes.ClubRequestsByRequestedByAndCreatedAtQuery
>;
export const clubRequestsByStatusAndCreatedAt = /* GraphQL */ `query ClubRequestsByStatusAndCreatedAt(
  $status: ClubRequestStatus!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelClubRequestFilterInput
  $limit: Int
  $nextToken: String
) {
  clubRequestsByStatusAndCreatedAt(
    status: $status
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
      userClubRequestsCreatedId
      cMSUserClubRequestsReviewedId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ClubRequestsByStatusAndCreatedAtQueryVariables,
  APITypes.ClubRequestsByStatusAndCreatedAtQuery
>;
export const clubRequestsByReviewedByAndReviewedAt = /* GraphQL */ `query ClubRequestsByReviewedByAndReviewedAt(
  $reviewedBy: ID!
  $reviewedAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelClubRequestFilterInput
  $limit: Int
  $nextToken: String
) {
  clubRequestsByReviewedByAndReviewedAt(
    reviewedBy: $reviewedBy
    reviewedAt: $reviewedAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
      userClubRequestsCreatedId
      cMSUserClubRequestsReviewedId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ClubRequestsByReviewedByAndReviewedAtQueryVariables,
  APITypes.ClubRequestsByReviewedByAndReviewedAtQuery
>;
export const getConversation = /* GraphQL */ `query GetConversation($id: ID!) {
  getConversation(id: $id) {
    id
    participantIds
    participantKey
    participants {
      nextToken
      __typename
    }
    messages {
      nextToken
      __typename
    }
    lastMessageText
    lastMessageSenderId
    lastMessageAt
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetConversationQueryVariables,
  APITypes.GetConversationQuery
>;
export const listConversations = /* GraphQL */ `query ListConversations(
  $filter: ModelConversationFilterInput
  $limit: Int
  $nextToken: String
) {
  listConversations(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      participantIds
      participantKey
      lastMessageText
      lastMessageSenderId
      lastMessageAt
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListConversationsQueryVariables,
  APITypes.ListConversationsQuery
>;
export const conversationByParticipants = /* GraphQL */ `query ConversationByParticipants(
  $participantKey: String!
  $sortDirection: ModelSortDirection
  $filter: ModelConversationFilterInput
  $limit: Int
  $nextToken: String
) {
  conversationByParticipants(
    participantKey: $participantKey
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      participantIds
      participantKey
      lastMessageText
      lastMessageSenderId
      lastMessageAt
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ConversationByParticipantsQueryVariables,
  APITypes.ConversationByParticipantsQuery
>;
export const getConversationParticipant = /* GraphQL */ `query GetConversationParticipant($id: ID!) {
  getConversationParticipant(id: $id) {
    id
    conversationId
    userId
    user {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    conversation {
      id
      participantIds
      participantKey
      lastMessageText
      lastMessageSenderId
      lastMessageAt
      createdAt
      updatedAt
      __typename
    }
    unreadCount
    lastReadAt
    isMuted
    isDeleted
    requestStatus
    createdAt
    updatedAt
    userConversationParticipantsId
    conversationParticipantsId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetConversationParticipantQueryVariables,
  APITypes.GetConversationParticipantQuery
>;
export const listConversationParticipants = /* GraphQL */ `query ListConversationParticipants(
  $filter: ModelConversationParticipantFilterInput
  $limit: Int
  $nextToken: String
) {
  listConversationParticipants(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      conversationId
      userId
      unreadCount
      lastReadAt
      isMuted
      isDeleted
      requestStatus
      createdAt
      updatedAt
      userConversationParticipantsId
      conversationParticipantsId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListConversationParticipantsQueryVariables,
  APITypes.ListConversationParticipantsQuery
>;
export const conversationParticipantsByConversationIdAndUserId = /* GraphQL */ `query ConversationParticipantsByConversationIdAndUserId(
  $conversationId: ID!
  $userId: ModelIDKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelConversationParticipantFilterInput
  $limit: Int
  $nextToken: String
) {
  conversationParticipantsByConversationIdAndUserId(
    conversationId: $conversationId
    userId: $userId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      conversationId
      userId
      unreadCount
      lastReadAt
      isMuted
      isDeleted
      requestStatus
      createdAt
      updatedAt
      userConversationParticipantsId
      conversationParticipantsId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ConversationParticipantsByConversationIdAndUserIdQueryVariables,
  APITypes.ConversationParticipantsByConversationIdAndUserIdQuery
>;
export const conversationParticipantsByUserIdAndConversationId = /* GraphQL */ `query ConversationParticipantsByUserIdAndConversationId(
  $userId: ID!
  $conversationId: ModelIDKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelConversationParticipantFilterInput
  $limit: Int
  $nextToken: String
) {
  conversationParticipantsByUserIdAndConversationId(
    userId: $userId
    conversationId: $conversationId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      conversationId
      userId
      unreadCount
      lastReadAt
      isMuted
      isDeleted
      requestStatus
      createdAt
      updatedAt
      userConversationParticipantsId
      conversationParticipantsId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ConversationParticipantsByUserIdAndConversationIdQueryVariables,
  APITypes.ConversationParticipantsByUserIdAndConversationIdQuery
>;
export const getMessage = /* GraphQL */ `query GetMessage($id: ID!) {
  getMessage(id: $id) {
    id
    conversationId
    conversation {
      id
      participantIds
      participantKey
      lastMessageText
      lastMessageSenderId
      lastMessageAt
      createdAt
      updatedAt
      __typename
    }
    participantIds
    senderId
    sender {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    text
    readAt
    deletedBySender
    deletedForEveryone
    senderDeleted
    createdAt
    updatedAt
    userMessagesId
    conversationMessagesId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetMessageQueryVariables,
  APITypes.GetMessageQuery
>;
export const listMessages = /* GraphQL */ `query ListMessages(
  $filter: ModelMessageFilterInput
  $limit: Int
  $nextToken: String
) {
  listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      conversationId
      participantIds
      senderId
      text
      readAt
      deletedBySender
      deletedForEveryone
      senderDeleted
      createdAt
      updatedAt
      userMessagesId
      conversationMessagesId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListMessagesQueryVariables,
  APITypes.ListMessagesQuery
>;
export const messagesByConversationIdAndCreatedAt = /* GraphQL */ `query MessagesByConversationIdAndCreatedAt(
  $conversationId: ID!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelMessageFilterInput
  $limit: Int
  $nextToken: String
) {
  messagesByConversationIdAndCreatedAt(
    conversationId: $conversationId
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      conversationId
      participantIds
      senderId
      text
      readAt
      deletedBySender
      deletedForEveryone
      senderDeleted
      createdAt
      updatedAt
      userMessagesId
      conversationMessagesId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.MessagesByConversationIdAndCreatedAtQueryVariables,
  APITypes.MessagesByConversationIdAndCreatedAtQuery
>;
export const messagesBySenderIdAndCreatedAt = /* GraphQL */ `query MessagesBySenderIdAndCreatedAt(
  $senderId: ID!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelMessageFilterInput
  $limit: Int
  $nextToken: String
) {
  messagesBySenderIdAndCreatedAt(
    senderId: $senderId
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      conversationId
      participantIds
      senderId
      text
      readAt
      deletedBySender
      deletedForEveryone
      senderDeleted
      createdAt
      updatedAt
      userMessagesId
      conversationMessagesId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.MessagesBySenderIdAndCreatedAtQueryVariables,
  APITypes.MessagesBySenderIdAndCreatedAtQuery
>;
export const searchMessages = /* GraphQL */ `query SearchMessages(
  $filter: SearchableMessageFilterInput
  $sort: [SearchableMessageSortInput]
  $limit: Int
  $nextToken: String
  $from: Int
  $aggregates: [SearchableMessageAggregationInput]
) {
  searchMessages(
    filter: $filter
    sort: $sort
    limit: $limit
    nextToken: $nextToken
    from: $from
    aggregates: $aggregates
  ) {
    items {
      id
      conversationId
      participantIds
      senderId
      text
      readAt
      deletedBySender
      deletedForEveryone
      senderDeleted
      createdAt
      updatedAt
      userMessagesId
      conversationMessagesId
      __typename
    }
    nextToken
    total
    aggregateItems {
      name
      result {
        ... on SearchableAggregateScalarResult {
          value
        }
        ... on SearchableAggregateBucketResult {
          buckets {
            key
            doc_count
            __typename
          }
        }
      }
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SearchMessagesQueryVariables,
  APITypes.SearchMessagesQuery
>;
export const getUserLikes = /* GraphQL */ `query GetUserLikes($id: ID!) {
  getUserLikes(id: $id) {
    id
    userId
    postId
    user {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    post {
      id
      description
      authorId
      locationId
      photoKey
      photoModerationStatus
      photoKeys
      likesCount
      title
      sharedPostId
      shareComment
      sharesCount
      createdAt
      clubId
      clubIsPrivate
      updatedAt
      userPostsId
      postSharesId
      clubPostsId
      owner
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserLikesQueryVariables,
  APITypes.GetUserLikesQuery
>;
export const listUserLikes = /* GraphQL */ `query ListUserLikes(
  $filter: ModelUserLikesFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserLikes(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      postId
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserLikesQueryVariables,
  APITypes.ListUserLikesQuery
>;
export const userLikesByUserId = /* GraphQL */ `query UserLikesByUserId(
  $userId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelUserLikesFilterInput
  $limit: Int
  $nextToken: String
) {
  userLikesByUserId(
    userId: $userId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      postId
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserLikesByUserIdQueryVariables,
  APITypes.UserLikesByUserIdQuery
>;
export const userLikesByPostId = /* GraphQL */ `query UserLikesByPostId(
  $postId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelUserLikesFilterInput
  $limit: Int
  $nextToken: String
) {
  userLikesByPostId(
    postId: $postId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      postId
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserLikesByPostIdQueryVariables,
  APITypes.UserLikesByPostIdQuery
>;
export const getUserWishListWhiskeys = /* GraphQL */ `query GetUserWishListWhiskeys($id: ID!) {
  getUserWishListWhiskeys(id: $id) {
    id
    userId
    whiskeyId
    user {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    whiskey {
      id
      name
      description
      type
      brandId
      brand
      age
      calculatedRating
      distillery
      origin
      proof
      proofType
      batch
      rick
      barrel
      bottle
      storePick
      fullName
      distilleryTastingNotes
      specialistChoice
      starterPick
      singleBarrel
      createdAt
      updatedAt
      userBrandWhiskeysId
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserWishListWhiskeysQueryVariables,
  APITypes.GetUserWishListWhiskeysQuery
>;
export const listUserWishListWhiskeys = /* GraphQL */ `query ListUserWishListWhiskeys(
  $filter: ModelUserWishListWhiskeysFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserWishListWhiskeys(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      whiskeyId
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserWishListWhiskeysQueryVariables,
  APITypes.ListUserWishListWhiskeysQuery
>;
export const userWishListWhiskeysByUserId = /* GraphQL */ `query UserWishListWhiskeysByUserId(
  $userId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelUserWishListWhiskeysFilterInput
  $limit: Int
  $nextToken: String
) {
  userWishListWhiskeysByUserId(
    userId: $userId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      whiskeyId
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserWishListWhiskeysByUserIdQueryVariables,
  APITypes.UserWishListWhiskeysByUserIdQuery
>;
export const userWishListWhiskeysByWhiskeyId = /* GraphQL */ `query UserWishListWhiskeysByWhiskeyId(
  $whiskeyId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelUserWishListWhiskeysFilterInput
  $limit: Int
  $nextToken: String
) {
  userWishListWhiskeysByWhiskeyId(
    whiskeyId: $whiskeyId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      whiskeyId
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserWishListWhiskeysByWhiskeyIdQueryVariables,
  APITypes.UserWishListWhiskeysByWhiskeyIdQuery
>;
export const getUserFavoriteGuides = /* GraphQL */ `query GetUserFavoriteGuides($id: ID!) {
  getUserFavoriteGuides(id: $id) {
    id
    userId
    guidesId
    user {
      id
      personFirstName
      personLastName
      personFullName
      venueName
      venueSearchName
      venuePhone
      venueAddressCountry
      venueAddressCity
      venueAddressStreet
      venueAddressNumber
      venueAddressState
      venueCalculatedRating
      venueCheckinsCount
      venueWebsite
      venueHours
      brandName
      brandSearchName
      brandDescription
      brandWebsite
      brandCountry
      brandFoundedYear
      brandStory
      userType
      username
      profilePictureKey
      profilePictureModerationStatus
      coverPictureKey
      coverPictureModerationStatus
      bio
      deleted
      archived
      isMyCollectionPublic
      followers
      following
      expoTokens
      isOnRewards
      blockedUsers
      toBeRedeemed
      externalId
      dmPrivacySetting
      createdAt
      updatedAt
      owner
      __typename
    }
    guides {
      id
      title
      subtitle
      tag
      body
      createdAt
      updatedAt
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserFavoriteGuidesQueryVariables,
  APITypes.GetUserFavoriteGuidesQuery
>;
export const listUserFavoriteGuides = /* GraphQL */ `query ListUserFavoriteGuides(
  $filter: ModelUserFavoriteGuidesFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserFavoriteGuides(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      guidesId
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserFavoriteGuidesQueryVariables,
  APITypes.ListUserFavoriteGuidesQuery
>;
export const userFavoriteGuidesByUserId = /* GraphQL */ `query UserFavoriteGuidesByUserId(
  $userId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelUserFavoriteGuidesFilterInput
  $limit: Int
  $nextToken: String
) {
  userFavoriteGuidesByUserId(
    userId: $userId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      guidesId
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserFavoriteGuidesByUserIdQueryVariables,
  APITypes.UserFavoriteGuidesByUserIdQuery
>;
export const userFavoriteGuidesByGuidesId = /* GraphQL */ `query UserFavoriteGuidesByGuidesId(
  $guidesId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelUserFavoriteGuidesFilterInput
  $limit: Int
  $nextToken: String
) {
  userFavoriteGuidesByGuidesId(
    guidesId: $guidesId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      userId
      guidesId
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserFavoriteGuidesByGuidesIdQueryVariables,
  APITypes.UserFavoriteGuidesByGuidesIdQuery
>;
export const getCognitoUserFromUsername = /* GraphQL */ `query GetCognitoUserFromUsername($userId: ID!) {
  getCognitoUserFromUsername(userId: $userId) {
    email
    username
    userStatus
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCognitoUserFromUsernameQueryVariables,
  APITypes.GetCognitoUserFromUsernameQuery
>;
