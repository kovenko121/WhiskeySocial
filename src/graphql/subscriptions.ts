/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../types/api";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onSendMessage = /* GraphQL */ `subscription OnSendMessage($conversationId: ID!) {
  onSendMessage(conversationId: $conversationId) {
    messageId
    conversationId
    text
    senderId
    createdAt
    isNewConversation
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnSendMessageSubscriptionVariables,
  APITypes.OnSendMessageSubscription
>;
export const onMarkMessagesAsRead = /* GraphQL */ `subscription OnMarkMessagesAsRead($conversationId: ID!) {
  onMarkMessagesAsRead(conversationId: $conversationId) {
    success
    conversationId
    readAt
    updatedMessageCount
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnMarkMessagesAsReadSubscriptionVariables,
  APITypes.OnMarkMessagesAsReadSubscription
>;
export const onSoftDeleteMessage = /* GraphQL */ `subscription OnSoftDeleteMessage($conversationId: ID!) {
  onSoftDeleteMessage(conversationId: $conversationId) {
    success
    messageId
    conversationId
    deleteForEveryone
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnSoftDeleteMessageSubscriptionVariables,
  APITypes.OnSoftDeleteMessageSubscription
>;
export const onUpdateUser = /* GraphQL */ `subscription OnUpdateUser(
  $filter: ModelSubscriptionUserFilterInput
  $owner: String
) {
  onUpdateUser(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserSubscriptionVariables,
  APITypes.OnUpdateUserSubscription
>;
export const onDeleteUser = /* GraphQL */ `subscription OnDeleteUser(
  $filter: ModelSubscriptionUserFilterInput
  $owner: String
) {
  onDeleteUser(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserSubscriptionVariables,
  APITypes.OnDeleteUserSubscription
>;
export const onCreateUserPours = /* GraphQL */ `subscription OnCreateUserPours(
  $filter: ModelSubscriptionUserPoursFilterInput
  $owner: String
) {
  onCreateUserPours(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserPoursSubscriptionVariables,
  APITypes.OnCreateUserPoursSubscription
>;
export const onUpdateUserPours = /* GraphQL */ `subscription OnUpdateUserPours(
  $filter: ModelSubscriptionUserPoursFilterInput
  $owner: String
) {
  onUpdateUserPours(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserPoursSubscriptionVariables,
  APITypes.OnUpdateUserPoursSubscription
>;
export const onDeleteUserPours = /* GraphQL */ `subscription OnDeleteUserPours(
  $filter: ModelSubscriptionUserPoursFilterInput
  $owner: String
) {
  onDeleteUserPours(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserPoursSubscriptionVariables,
  APITypes.OnDeleteUserPoursSubscription
>;
export const onCreateVenueRequest = /* GraphQL */ `subscription OnCreateVenueRequest(
  $filter: ModelSubscriptionVenueRequestFilterInput
) {
  onCreateVenueRequest(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateVenueRequestSubscriptionVariables,
  APITypes.OnCreateVenueRequestSubscription
>;
export const onUpdateVenueRequest = /* GraphQL */ `subscription OnUpdateVenueRequest(
  $filter: ModelSubscriptionVenueRequestFilterInput
) {
  onUpdateVenueRequest(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateVenueRequestSubscriptionVariables,
  APITypes.OnUpdateVenueRequestSubscription
>;
export const onDeleteVenueRequest = /* GraphQL */ `subscription OnDeleteVenueRequest(
  $filter: ModelSubscriptionVenueRequestFilterInput
) {
  onDeleteVenueRequest(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteVenueRequestSubscriptionVariables,
  APITypes.OnDeleteVenueRequestSubscription
>;
export const onCreateUserWhiskeys = /* GraphQL */ `subscription OnCreateUserWhiskeys(
  $filter: ModelSubscriptionUserWhiskeysFilterInput
  $owner: String
) {
  onCreateUserWhiskeys(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserWhiskeysSubscriptionVariables,
  APITypes.OnCreateUserWhiskeysSubscription
>;
export const onUpdateUserWhiskeys = /* GraphQL */ `subscription OnUpdateUserWhiskeys(
  $filter: ModelSubscriptionUserWhiskeysFilterInput
  $owner: String
) {
  onUpdateUserWhiskeys(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserWhiskeysSubscriptionVariables,
  APITypes.OnUpdateUserWhiskeysSubscription
>;
export const onDeleteUserWhiskeys = /* GraphQL */ `subscription OnDeleteUserWhiskeys(
  $filter: ModelSubscriptionUserWhiskeysFilterInput
  $owner: String
) {
  onDeleteUserWhiskeys(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserWhiskeysSubscriptionVariables,
  APITypes.OnDeleteUserWhiskeysSubscription
>;
export const onCreateUserTrendingWhiskeys = /* GraphQL */ `subscription OnCreateUserTrendingWhiskeys(
  $filter: ModelSubscriptionUserTrendingWhiskeysFilterInput
  $owner: String
) {
  onCreateUserTrendingWhiskeys(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserTrendingWhiskeysSubscriptionVariables,
  APITypes.OnCreateUserTrendingWhiskeysSubscription
>;
export const onUpdateUserTrendingWhiskeys = /* GraphQL */ `subscription OnUpdateUserTrendingWhiskeys(
  $filter: ModelSubscriptionUserTrendingWhiskeysFilterInput
  $owner: String
) {
  onUpdateUserTrendingWhiskeys(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserTrendingWhiskeysSubscriptionVariables,
  APITypes.OnUpdateUserTrendingWhiskeysSubscription
>;
export const onDeleteUserTrendingWhiskeys = /* GraphQL */ `subscription OnDeleteUserTrendingWhiskeys(
  $filter: ModelSubscriptionUserTrendingWhiskeysFilterInput
  $owner: String
) {
  onDeleteUserTrendingWhiskeys(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserTrendingWhiskeysSubscriptionVariables,
  APITypes.OnDeleteUserTrendingWhiskeysSubscription
>;
export const onCreateWhiskey = /* GraphQL */ `subscription OnCreateWhiskey($filter: ModelSubscriptionWhiskeyFilterInput) {
  onCreateWhiskey(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateWhiskeySubscriptionVariables,
  APITypes.OnCreateWhiskeySubscription
>;
export const onUpdateWhiskey = /* GraphQL */ `subscription OnUpdateWhiskey($filter: ModelSubscriptionWhiskeyFilterInput) {
  onUpdateWhiskey(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateWhiskeySubscriptionVariables,
  APITypes.OnUpdateWhiskeySubscription
>;
export const onDeleteWhiskey = /* GraphQL */ `subscription OnDeleteWhiskey($filter: ModelSubscriptionWhiskeyFilterInput) {
  onDeleteWhiskey(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteWhiskeySubscriptionVariables,
  APITypes.OnDeleteWhiskeySubscription
>;
export const onCreateFeatureFlags = /* GraphQL */ `subscription OnCreateFeatureFlags(
  $filter: ModelSubscriptionFeatureFlagsFilterInput
) {
  onCreateFeatureFlags(filter: $filter) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateFeatureFlagsSubscriptionVariables,
  APITypes.OnCreateFeatureFlagsSubscription
>;
export const onUpdateFeatureFlags = /* GraphQL */ `subscription OnUpdateFeatureFlags(
  $filter: ModelSubscriptionFeatureFlagsFilterInput
) {
  onUpdateFeatureFlags(filter: $filter) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateFeatureFlagsSubscriptionVariables,
  APITypes.OnUpdateFeatureFlagsSubscription
>;
export const onDeleteFeatureFlags = /* GraphQL */ `subscription OnDeleteFeatureFlags(
  $filter: ModelSubscriptionFeatureFlagsFilterInput
) {
  onDeleteFeatureFlags(filter: $filter) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteFeatureFlagsSubscriptionVariables,
  APITypes.OnDeleteFeatureFlagsSubscription
>;
export const onCreateAppConfig = /* GraphQL */ `subscription OnCreateAppConfig($filter: ModelSubscriptionAppConfigFilterInput) {
  onCreateAppConfig(filter: $filter) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateAppConfigSubscriptionVariables,
  APITypes.OnCreateAppConfigSubscription
>;
export const onUpdateAppConfig = /* GraphQL */ `subscription OnUpdateAppConfig($filter: ModelSubscriptionAppConfigFilterInput) {
  onUpdateAppConfig(filter: $filter) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateAppConfigSubscriptionVariables,
  APITypes.OnUpdateAppConfigSubscription
>;
export const onDeleteAppConfig = /* GraphQL */ `subscription OnDeleteAppConfig($filter: ModelSubscriptionAppConfigFilterInput) {
  onDeleteAppConfig(filter: $filter) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteAppConfigSubscriptionVariables,
  APITypes.OnDeleteAppConfigSubscription
>;
export const onCreateReward = /* GraphQL */ `subscription OnCreateReward($filter: ModelSubscriptionRewardFilterInput) {
  onCreateReward(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateRewardSubscriptionVariables,
  APITypes.OnCreateRewardSubscription
>;
export const onUpdateReward = /* GraphQL */ `subscription OnUpdateReward($filter: ModelSubscriptionRewardFilterInput) {
  onUpdateReward(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateRewardSubscriptionVariables,
  APITypes.OnUpdateRewardSubscription
>;
export const onDeleteReward = /* GraphQL */ `subscription OnDeleteReward($filter: ModelSubscriptionRewardFilterInput) {
  onDeleteReward(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteRewardSubscriptionVariables,
  APITypes.OnDeleteRewardSubscription
>;
export const onCreateGuideTags = /* GraphQL */ `subscription OnCreateGuideTags($filter: ModelSubscriptionGuideTagsFilterInput) {
  onCreateGuideTags(filter: $filter) {
    id
    name
    count
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateGuideTagsSubscriptionVariables,
  APITypes.OnCreateGuideTagsSubscription
>;
export const onUpdateGuideTags = /* GraphQL */ `subscription OnUpdateGuideTags($filter: ModelSubscriptionGuideTagsFilterInput) {
  onUpdateGuideTags(filter: $filter) {
    id
    name
    count
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateGuideTagsSubscriptionVariables,
  APITypes.OnUpdateGuideTagsSubscription
>;
export const onDeleteGuideTags = /* GraphQL */ `subscription OnDeleteGuideTags($filter: ModelSubscriptionGuideTagsFilterInput) {
  onDeleteGuideTags(filter: $filter) {
    id
    name
    count
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteGuideTagsSubscriptionVariables,
  APITypes.OnDeleteGuideTagsSubscription
>;
export const onCreateGuides = /* GraphQL */ `subscription OnCreateGuides($filter: ModelSubscriptionGuidesFilterInput) {
  onCreateGuides(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateGuidesSubscriptionVariables,
  APITypes.OnCreateGuidesSubscription
>;
export const onUpdateGuides = /* GraphQL */ `subscription OnUpdateGuides($filter: ModelSubscriptionGuidesFilterInput) {
  onUpdateGuides(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateGuidesSubscriptionVariables,
  APITypes.OnUpdateGuidesSubscription
>;
export const onDeleteGuides = /* GraphQL */ `subscription OnDeleteGuides($filter: ModelSubscriptionGuidesFilterInput) {
  onDeleteGuides(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteGuidesSubscriptionVariables,
  APITypes.OnDeleteGuidesSubscription
>;
export const onUpdateUserReward = /* GraphQL */ `subscription OnUpdateUserReward(
  $filter: ModelSubscriptionUserRewardFilterInput
  $owner: String
) {
  onUpdateUserReward(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserRewardSubscriptionVariables,
  APITypes.OnUpdateUserRewardSubscription
>;
export const onCreateReview = /* GraphQL */ `subscription OnCreateReview(
  $filter: ModelSubscriptionReviewFilterInput
  $owner: String
) {
  onCreateReview(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateReviewSubscriptionVariables,
  APITypes.OnCreateReviewSubscription
>;
export const onUpdateReview = /* GraphQL */ `subscription OnUpdateReview(
  $filter: ModelSubscriptionReviewFilterInput
  $owner: String
) {
  onUpdateReview(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateReviewSubscriptionVariables,
  APITypes.OnUpdateReviewSubscription
>;
export const onDeleteReview = /* GraphQL */ `subscription OnDeleteReview(
  $filter: ModelSubscriptionReviewFilterInput
  $owner: String
) {
  onDeleteReview(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteReviewSubscriptionVariables,
  APITypes.OnDeleteReviewSubscription
>;
export const onCreateSuggestion = /* GraphQL */ `subscription OnCreateSuggestion(
  $filter: ModelSubscriptionSuggestionFilterInput
) {
  onCreateSuggestion(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateSuggestionSubscriptionVariables,
  APITypes.OnCreateSuggestionSubscription
>;
export const onUpdateSuggestion = /* GraphQL */ `subscription OnUpdateSuggestion(
  $filter: ModelSubscriptionSuggestionFilterInput
) {
  onUpdateSuggestion(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateSuggestionSubscriptionVariables,
  APITypes.OnUpdateSuggestionSubscription
>;
export const onDeleteSuggestion = /* GraphQL */ `subscription OnDeleteSuggestion(
  $filter: ModelSubscriptionSuggestionFilterInput
) {
  onDeleteSuggestion(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteSuggestionSubscriptionVariables,
  APITypes.OnDeleteSuggestionSubscription
>;
export const onCreateComment = /* GraphQL */ `subscription OnCreateComment(
  $filter: ModelSubscriptionCommentFilterInput
  $owner: String
) {
  onCreateComment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCommentSubscriptionVariables,
  APITypes.OnCreateCommentSubscription
>;
export const onUpdateComment = /* GraphQL */ `subscription OnUpdateComment(
  $filter: ModelSubscriptionCommentFilterInput
  $owner: String
) {
  onUpdateComment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCommentSubscriptionVariables,
  APITypes.OnUpdateCommentSubscription
>;
export const onDeleteComment = /* GraphQL */ `subscription OnDeleteComment(
  $filter: ModelSubscriptionCommentFilterInput
  $owner: String
) {
  onDeleteComment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCommentSubscriptionVariables,
  APITypes.OnDeleteCommentSubscription
>;
export const onCreatePost = /* GraphQL */ `subscription OnCreatePost(
  $filter: ModelSubscriptionPostFilterInput
  $owner: String
) {
  onCreatePost(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreatePostSubscriptionVariables,
  APITypes.OnCreatePostSubscription
>;
export const onUpdatePost = /* GraphQL */ `subscription OnUpdatePost(
  $filter: ModelSubscriptionPostFilterInput
  $owner: String
) {
  onUpdatePost(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdatePostSubscriptionVariables,
  APITypes.OnUpdatePostSubscription
>;
export const onDeletePost = /* GraphQL */ `subscription OnDeletePost(
  $filter: ModelSubscriptionPostFilterInput
  $owner: String
) {
  onDeletePost(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeletePostSubscriptionVariables,
  APITypes.OnDeletePostSubscription
>;
export const onCreateNotification = /* GraphQL */ `subscription OnCreateNotification(
  $filter: ModelSubscriptionNotificationFilterInput
  $owner: String
) {
  onCreateNotification(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateNotificationSubscriptionVariables,
  APITypes.OnCreateNotificationSubscription
>;
export const onUpdateNotification = /* GraphQL */ `subscription OnUpdateNotification(
  $filter: ModelSubscriptionNotificationFilterInput
  $owner: String
) {
  onUpdateNotification(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateNotificationSubscriptionVariables,
  APITypes.OnUpdateNotificationSubscription
>;
export const onDeleteNotification = /* GraphQL */ `subscription OnDeleteNotification(
  $filter: ModelSubscriptionNotificationFilterInput
  $owner: String
) {
  onDeleteNotification(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteNotificationSubscriptionVariables,
  APITypes.OnDeleteNotificationSubscription
>;
export const onCreateAdCampaign = /* GraphQL */ `subscription OnCreateAdCampaign(
  $filter: ModelSubscriptionAdCampaignFilterInput
) {
  onCreateAdCampaign(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateAdCampaignSubscriptionVariables,
  APITypes.OnCreateAdCampaignSubscription
>;
export const onUpdateAdCampaign = /* GraphQL */ `subscription OnUpdateAdCampaign(
  $filter: ModelSubscriptionAdCampaignFilterInput
) {
  onUpdateAdCampaign(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateAdCampaignSubscriptionVariables,
  APITypes.OnUpdateAdCampaignSubscription
>;
export const onDeleteAdCampaign = /* GraphQL */ `subscription OnDeleteAdCampaign(
  $filter: ModelSubscriptionAdCampaignFilterInput
) {
  onDeleteAdCampaign(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteAdCampaignSubscriptionVariables,
  APITypes.OnDeleteAdCampaignSubscription
>;
export const onCreateReport = /* GraphQL */ `subscription OnCreateReport($filter: ModelSubscriptionReportFilterInput) {
  onCreateReport(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateReportSubscriptionVariables,
  APITypes.OnCreateReportSubscription
>;
export const onUpdateReport = /* GraphQL */ `subscription OnUpdateReport($filter: ModelSubscriptionReportFilterInput) {
  onUpdateReport(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateReportSubscriptionVariables,
  APITypes.OnUpdateReportSubscription
>;
export const onDeleteReport = /* GraphQL */ `subscription OnDeleteReport($filter: ModelSubscriptionReportFilterInput) {
  onDeleteReport(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteReportSubscriptionVariables,
  APITypes.OnDeleteReportSubscription
>;
export const onCreateEvent = /* GraphQL */ `subscription OnCreateEvent($filter: ModelSubscriptionEventFilterInput) {
  onCreateEvent(filter: $filter) {
    id
    campaign
    interactions
    impressions
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateEventSubscriptionVariables,
  APITypes.OnCreateEventSubscription
>;
export const onUpdateEvent = /* GraphQL */ `subscription OnUpdateEvent($filter: ModelSubscriptionEventFilterInput) {
  onUpdateEvent(filter: $filter) {
    id
    campaign
    interactions
    impressions
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateEventSubscriptionVariables,
  APITypes.OnUpdateEventSubscription
>;
export const onDeleteEvent = /* GraphQL */ `subscription OnDeleteEvent($filter: ModelSubscriptionEventFilterInput) {
  onDeleteEvent(filter: $filter) {
    id
    campaign
    interactions
    impressions
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteEventSubscriptionVariables,
  APITypes.OnDeleteEventSubscription
>;
export const onCreateUpdatePostLikesResult = /* GraphQL */ `subscription OnCreateUpdatePostLikesResult(
  $filter: ModelSubscriptionUpdatePostLikesResultFilterInput
) {
  onCreateUpdatePostLikesResult(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUpdatePostLikesResultSubscriptionVariables,
  APITypes.OnCreateUpdatePostLikesResultSubscription
>;
export const onUpdateUpdatePostLikesResult = /* GraphQL */ `subscription OnUpdateUpdatePostLikesResult(
  $filter: ModelSubscriptionUpdatePostLikesResultFilterInput
) {
  onUpdateUpdatePostLikesResult(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUpdatePostLikesResultSubscriptionVariables,
  APITypes.OnUpdateUpdatePostLikesResultSubscription
>;
export const onDeleteUpdatePostLikesResult = /* GraphQL */ `subscription OnDeleteUpdatePostLikesResult(
  $filter: ModelSubscriptionUpdatePostLikesResultFilterInput
) {
  onDeleteUpdatePostLikesResult(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUpdatePostLikesResultSubscriptionVariables,
  APITypes.OnDeleteUpdatePostLikesResultSubscription
>;
export const onCreateCMSUser = /* GraphQL */ `subscription OnCreateCMSUser($filter: ModelSubscriptionCMSUserFilterInput) {
  onCreateCMSUser(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCMSUserSubscriptionVariables,
  APITypes.OnCreateCMSUserSubscription
>;
export const onUpdateCMSUser = /* GraphQL */ `subscription OnUpdateCMSUser($filter: ModelSubscriptionCMSUserFilterInput) {
  onUpdateCMSUser(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCMSUserSubscriptionVariables,
  APITypes.OnUpdateCMSUserSubscription
>;
export const onDeleteCMSUser = /* GraphQL */ `subscription OnDeleteCMSUser($filter: ModelSubscriptionCMSUserFilterInput) {
  onDeleteCMSUser(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCMSUserSubscriptionVariables,
  APITypes.OnDeleteCMSUserSubscription
>;
export const onCreateCMSUserBrand = /* GraphQL */ `subscription OnCreateCMSUserBrand(
  $filter: ModelSubscriptionCMSUserBrandFilterInput
) {
  onCreateCMSUserBrand(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCMSUserBrandSubscriptionVariables,
  APITypes.OnCreateCMSUserBrandSubscription
>;
export const onUpdateCMSUserBrand = /* GraphQL */ `subscription OnUpdateCMSUserBrand(
  $filter: ModelSubscriptionCMSUserBrandFilterInput
) {
  onUpdateCMSUserBrand(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCMSUserBrandSubscriptionVariables,
  APITypes.OnUpdateCMSUserBrandSubscription
>;
export const onDeleteCMSUserBrand = /* GraphQL */ `subscription OnDeleteCMSUserBrand(
  $filter: ModelSubscriptionCMSUserBrandFilterInput
) {
  onDeleteCMSUserBrand(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCMSUserBrandSubscriptionVariables,
  APITypes.OnDeleteCMSUserBrandSubscription
>;
export const onCreateAppVersion = /* GraphQL */ `subscription OnCreateAppVersion(
  $filter: ModelSubscriptionAppVersionFilterInput
) {
  onCreateAppVersion(filter: $filter) {
    id
    platform
    currentVersion
    minimumVersion
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateAppVersionSubscriptionVariables,
  APITypes.OnCreateAppVersionSubscription
>;
export const onUpdateAppVersion = /* GraphQL */ `subscription OnUpdateAppVersion(
  $filter: ModelSubscriptionAppVersionFilterInput
) {
  onUpdateAppVersion(filter: $filter) {
    id
    platform
    currentVersion
    minimumVersion
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateAppVersionSubscriptionVariables,
  APITypes.OnUpdateAppVersionSubscription
>;
export const onDeleteAppVersion = /* GraphQL */ `subscription OnDeleteAppVersion(
  $filter: ModelSubscriptionAppVersionFilterInput
) {
  onDeleteAppVersion(filter: $filter) {
    id
    platform
    currentVersion
    minimumVersion
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteAppVersionSubscriptionVariables,
  APITypes.OnDeleteAppVersionSubscription
>;
export const onCreateClub = /* GraphQL */ `subscription OnCreateClub($filter: ModelSubscriptionClubFilterInput) {
  onCreateClub(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateClubSubscriptionVariables,
  APITypes.OnCreateClubSubscription
>;
export const onUpdateClub = /* GraphQL */ `subscription OnUpdateClub($filter: ModelSubscriptionClubFilterInput) {
  onUpdateClub(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateClubSubscriptionVariables,
  APITypes.OnUpdateClubSubscription
>;
export const onDeleteClub = /* GraphQL */ `subscription OnDeleteClub($filter: ModelSubscriptionClubFilterInput) {
  onDeleteClub(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteClubSubscriptionVariables,
  APITypes.OnDeleteClubSubscription
>;
export const onCreateClubMember = /* GraphQL */ `subscription OnCreateClubMember(
  $filter: ModelSubscriptionClubMemberFilterInput
) {
  onCreateClubMember(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateClubMemberSubscriptionVariables,
  APITypes.OnCreateClubMemberSubscription
>;
export const onUpdateClubMember = /* GraphQL */ `subscription OnUpdateClubMember(
  $filter: ModelSubscriptionClubMemberFilterInput
) {
  onUpdateClubMember(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateClubMemberSubscriptionVariables,
  APITypes.OnUpdateClubMemberSubscription
>;
export const onDeleteClubMember = /* GraphQL */ `subscription OnDeleteClubMember(
  $filter: ModelSubscriptionClubMemberFilterInput
) {
  onDeleteClubMember(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteClubMemberSubscriptionVariables,
  APITypes.OnDeleteClubMemberSubscription
>;
export const onCreateClubWhiskey = /* GraphQL */ `subscription OnCreateClubWhiskey(
  $filter: ModelSubscriptionClubWhiskeyFilterInput
) {
  onCreateClubWhiskey(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateClubWhiskeySubscriptionVariables,
  APITypes.OnCreateClubWhiskeySubscription
>;
export const onUpdateClubWhiskey = /* GraphQL */ `subscription OnUpdateClubWhiskey(
  $filter: ModelSubscriptionClubWhiskeyFilterInput
) {
  onUpdateClubWhiskey(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateClubWhiskeySubscriptionVariables,
  APITypes.OnUpdateClubWhiskeySubscription
>;
export const onDeleteClubWhiskey = /* GraphQL */ `subscription OnDeleteClubWhiskey(
  $filter: ModelSubscriptionClubWhiskeyFilterInput
) {
  onDeleteClubWhiskey(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteClubWhiskeySubscriptionVariables,
  APITypes.OnDeleteClubWhiskeySubscription
>;
export const onCreateClubRequest = /* GraphQL */ `subscription OnCreateClubRequest(
  $filter: ModelSubscriptionClubRequestFilterInput
  $requestedBy: String
) {
  onCreateClubRequest(filter: $filter, requestedBy: $requestedBy) {
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
` as GeneratedSubscription<
  APITypes.OnCreateClubRequestSubscriptionVariables,
  APITypes.OnCreateClubRequestSubscription
>;
export const onUpdateClubRequest = /* GraphQL */ `subscription OnUpdateClubRequest(
  $filter: ModelSubscriptionClubRequestFilterInput
  $requestedBy: String
) {
  onUpdateClubRequest(filter: $filter, requestedBy: $requestedBy) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateClubRequestSubscriptionVariables,
  APITypes.OnUpdateClubRequestSubscription
>;
export const onDeleteClubRequest = /* GraphQL */ `subscription OnDeleteClubRequest(
  $filter: ModelSubscriptionClubRequestFilterInput
  $requestedBy: String
) {
  onDeleteClubRequest(filter: $filter, requestedBy: $requestedBy) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteClubRequestSubscriptionVariables,
  APITypes.OnDeleteClubRequestSubscription
>;
export const onCreateConversation = /* GraphQL */ `subscription OnCreateConversation(
  $filter: ModelSubscriptionConversationFilterInput
) {
  onCreateConversation(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateConversationSubscriptionVariables,
  APITypes.OnCreateConversationSubscription
>;
export const onUpdateConversation = /* GraphQL */ `subscription OnUpdateConversation(
  $filter: ModelSubscriptionConversationFilterInput
) {
  onUpdateConversation(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateConversationSubscriptionVariables,
  APITypes.OnUpdateConversationSubscription
>;
export const onDeleteConversation = /* GraphQL */ `subscription OnDeleteConversation(
  $filter: ModelSubscriptionConversationFilterInput
) {
  onDeleteConversation(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteConversationSubscriptionVariables,
  APITypes.OnDeleteConversationSubscription
>;
export const onCreateConversationParticipant = /* GraphQL */ `subscription OnCreateConversationParticipant(
  $filter: ModelSubscriptionConversationParticipantFilterInput
  $userId: String
) {
  onCreateConversationParticipant(filter: $filter, userId: $userId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateConversationParticipantSubscriptionVariables,
  APITypes.OnCreateConversationParticipantSubscription
>;
export const onUpdateConversationParticipant = /* GraphQL */ `subscription OnUpdateConversationParticipant(
  $filter: ModelSubscriptionConversationParticipantFilterInput
  $userId: String
) {
  onUpdateConversationParticipant(filter: $filter, userId: $userId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateConversationParticipantSubscriptionVariables,
  APITypes.OnUpdateConversationParticipantSubscription
>;
export const onDeleteConversationParticipant = /* GraphQL */ `subscription OnDeleteConversationParticipant(
  $filter: ModelSubscriptionConversationParticipantFilterInput
  $userId: String
) {
  onDeleteConversationParticipant(filter: $filter, userId: $userId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteConversationParticipantSubscriptionVariables,
  APITypes.OnDeleteConversationParticipantSubscription
>;
export const onCreateMessage = /* GraphQL */ `subscription OnCreateMessage(
  $filter: ModelSubscriptionMessageFilterInput
  $senderId: String
) {
  onCreateMessage(filter: $filter, senderId: $senderId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateMessageSubscriptionVariables,
  APITypes.OnCreateMessageSubscription
>;
export const onUpdateMessage = /* GraphQL */ `subscription OnUpdateMessage(
  $filter: ModelSubscriptionMessageFilterInput
  $senderId: String
) {
  onUpdateMessage(filter: $filter, senderId: $senderId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateMessageSubscriptionVariables,
  APITypes.OnUpdateMessageSubscription
>;
export const onDeleteMessage = /* GraphQL */ `subscription OnDeleteMessage(
  $filter: ModelSubscriptionMessageFilterInput
  $senderId: String
) {
  onDeleteMessage(filter: $filter, senderId: $senderId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteMessageSubscriptionVariables,
  APITypes.OnDeleteMessageSubscription
>;
export const onCreateUserLikes = /* GraphQL */ `subscription OnCreateUserLikes(
  $filter: ModelSubscriptionUserLikesFilterInput
  $owner: String
) {
  onCreateUserLikes(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserLikesSubscriptionVariables,
  APITypes.OnCreateUserLikesSubscription
>;
export const onUpdateUserLikes = /* GraphQL */ `subscription OnUpdateUserLikes(
  $filter: ModelSubscriptionUserLikesFilterInput
  $owner: String
) {
  onUpdateUserLikes(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserLikesSubscriptionVariables,
  APITypes.OnUpdateUserLikesSubscription
>;
export const onDeleteUserLikes = /* GraphQL */ `subscription OnDeleteUserLikes(
  $filter: ModelSubscriptionUserLikesFilterInput
  $owner: String
) {
  onDeleteUserLikes(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserLikesSubscriptionVariables,
  APITypes.OnDeleteUserLikesSubscription
>;
export const onCreateUserWishListWhiskeys = /* GraphQL */ `subscription OnCreateUserWishListWhiskeys(
  $filter: ModelSubscriptionUserWishListWhiskeysFilterInput
  $owner: String
) {
  onCreateUserWishListWhiskeys(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserWishListWhiskeysSubscriptionVariables,
  APITypes.OnCreateUserWishListWhiskeysSubscription
>;
export const onUpdateUserWishListWhiskeys = /* GraphQL */ `subscription OnUpdateUserWishListWhiskeys(
  $filter: ModelSubscriptionUserWishListWhiskeysFilterInput
  $owner: String
) {
  onUpdateUserWishListWhiskeys(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserWishListWhiskeysSubscriptionVariables,
  APITypes.OnUpdateUserWishListWhiskeysSubscription
>;
export const onDeleteUserWishListWhiskeys = /* GraphQL */ `subscription OnDeleteUserWishListWhiskeys(
  $filter: ModelSubscriptionUserWishListWhiskeysFilterInput
  $owner: String
) {
  onDeleteUserWishListWhiskeys(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserWishListWhiskeysSubscriptionVariables,
  APITypes.OnDeleteUserWishListWhiskeysSubscription
>;
export const onCreateUserFavoriteGuides = /* GraphQL */ `subscription OnCreateUserFavoriteGuides(
  $filter: ModelSubscriptionUserFavoriteGuidesFilterInput
  $owner: String
) {
  onCreateUserFavoriteGuides(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserFavoriteGuidesSubscriptionVariables,
  APITypes.OnCreateUserFavoriteGuidesSubscription
>;
export const onUpdateUserFavoriteGuides = /* GraphQL */ `subscription OnUpdateUserFavoriteGuides(
  $filter: ModelSubscriptionUserFavoriteGuidesFilterInput
  $owner: String
) {
  onUpdateUserFavoriteGuides(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserFavoriteGuidesSubscriptionVariables,
  APITypes.OnUpdateUserFavoriteGuidesSubscription
>;
export const onDeleteUserFavoriteGuides = /* GraphQL */ `subscription OnDeleteUserFavoriteGuides(
  $filter: ModelSubscriptionUserFavoriteGuidesFilterInput
  $owner: String
) {
  onDeleteUserFavoriteGuides(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserFavoriteGuidesSubscriptionVariables,
  APITypes.OnDeleteUserFavoriteGuidesSubscription
>;
