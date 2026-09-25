/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../types/api";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const sendConfirmationCode = /* GraphQL */ `mutation SendConfirmationCode(
  $email: String!
  $operation: ConfirmationCodeOperation!
) {
  sendConfirmationCode(email: $email, operation: $operation)
}
` as GeneratedMutation<
  APITypes.SendConfirmationCodeMutationVariables,
  APITypes.SendConfirmationCodeMutation
>;
export const verifyConfirmationCode = /* GraphQL */ `mutation VerifyConfirmationCode(
  $email: String!
  $operation: ConfirmationCodeOperation!
  $code: String!
) {
  verifyConfirmationCode(email: $email, operation: $operation, code: $code)
}
` as GeneratedMutation<
  APITypes.VerifyConfirmationCodeMutationVariables,
  APITypes.VerifyConfirmationCodeMutation
>;
export const importWhiskeysByCSV = /* GraphQL */ `mutation ImportWhiskeysByCSV($fileKey: String!) {
  importWhiskeysByCSV(fileKey: $fileKey)
}
` as GeneratedMutation<
  APITypes.ImportWhiskeysByCSVMutationVariables,
  APITypes.ImportWhiskeysByCSVMutation
>;
export const importUserCollectionByCSV = /* GraphQL */ `mutation ImportUserCollectionByCSV($fileKey: String!) {
  importUserCollectionByCSV(fileKey: $fileKey) {
    successCount
    errors {
      row
      message
    }
  }
}`;
export const createNotification = /* GraphQL */ `mutation CreateNotification(
  $input: CreateNotificationInput!
  $condition: ModelNotificationConditionInput
) {
  createNotification(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateNotificationMutationVariables,
  APITypes.CreateNotificationMutation
>;
export const updateNotification = /* GraphQL */ `mutation UpdateNotification(
  $input: UpdateNotificationInput!
  $condition: ModelNotificationConditionInput
) {
  updateNotification(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateNotificationMutationVariables,
  APITypes.UpdateNotificationMutation
>;
export const createEvent = /* GraphQL */ `mutation CreateEvent(
  $input: CreateEventInput!
  $condition: ModelEventConditionInput
) {
  createEvent(input: $input, condition: $condition) {
    id
    campaign
    interactions
    impressions
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateEventMutationVariables,
  APITypes.CreateEventMutation
>;
export const updateEvent = /* GraphQL */ `mutation UpdateEvent(
  $input: UpdateEventInput!
  $condition: ModelEventConditionInput
) {
  updateEvent(input: $input, condition: $condition) {
    id
    campaign
    interactions
    impressions
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateEventMutationVariables,
  APITypes.UpdateEventMutation
>;
export const deleteEvent = /* GraphQL */ `mutation DeleteEvent(
  $input: DeleteEventInput!
  $condition: ModelEventConditionInput
) {
  deleteEvent(input: $input, condition: $condition) {
    id
    campaign
    interactions
    impressions
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteEventMutationVariables,
  APITypes.DeleteEventMutation
>;
export const createMessage = /* GraphQL */ `mutation CreateMessage(
  $input: CreateMessageInput!
  $condition: ModelMessageConditionInput
) {
  createMessage(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateMessageMutationVariables,
  APITypes.CreateMessageMutation
>;
export const updateUser = /* GraphQL */ `mutation UpdateUser(
  $input: UpdateUserInput!
  $condition: ModelUserConditionInput
) {
  updateUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUserMutationVariables,
  APITypes.UpdateUserMutation
>;
export const deleteUser = /* GraphQL */ `mutation DeleteUser(
  $input: DeleteUserInput!
  $condition: ModelUserConditionInput
) {
  deleteUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUserMutationVariables,
  APITypes.DeleteUserMutation
>;
export const createUserPours = /* GraphQL */ `mutation CreateUserPours(
  $input: CreateUserPoursInput!
  $condition: ModelUserPoursConditionInput
) {
  createUserPours(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateUserPoursMutationVariables,
  APITypes.CreateUserPoursMutation
>;
export const updateUserPours = /* GraphQL */ `mutation UpdateUserPours(
  $input: UpdateUserPoursInput!
  $condition: ModelUserPoursConditionInput
) {
  updateUserPours(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUserPoursMutationVariables,
  APITypes.UpdateUserPoursMutation
>;
export const deleteUserPours = /* GraphQL */ `mutation DeleteUserPours(
  $input: DeleteUserPoursInput!
  $condition: ModelUserPoursConditionInput
) {
  deleteUserPours(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUserPoursMutationVariables,
  APITypes.DeleteUserPoursMutation
>;
export const createVenueRequest = /* GraphQL */ `mutation CreateVenueRequest(
  $input: CreateVenueRequestInput!
  $condition: ModelVenueRequestConditionInput
) {
  createVenueRequest(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateVenueRequestMutationVariables,
  APITypes.CreateVenueRequestMutation
>;
export const updateVenueRequest = /* GraphQL */ `mutation UpdateVenueRequest(
  $input: UpdateVenueRequestInput!
  $condition: ModelVenueRequestConditionInput
) {
  updateVenueRequest(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateVenueRequestMutationVariables,
  APITypes.UpdateVenueRequestMutation
>;
export const deleteVenueRequest = /* GraphQL */ `mutation DeleteVenueRequest(
  $input: DeleteVenueRequestInput!
  $condition: ModelVenueRequestConditionInput
) {
  deleteVenueRequest(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteVenueRequestMutationVariables,
  APITypes.DeleteVenueRequestMutation
>;
export const createUserWhiskeys = /* GraphQL */ `mutation CreateUserWhiskeys(
  $input: CreateUserWhiskeysInput!
  $condition: ModelUserWhiskeysConditionInput
) {
  createUserWhiskeys(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateUserWhiskeysMutationVariables,
  APITypes.CreateUserWhiskeysMutation
>;
export const updateUserWhiskeys = /* GraphQL */ `mutation UpdateUserWhiskeys(
  $input: UpdateUserWhiskeysInput!
  $condition: ModelUserWhiskeysConditionInput
) {
  updateUserWhiskeys(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUserWhiskeysMutationVariables,
  APITypes.UpdateUserWhiskeysMutation
>;
export const deleteUserWhiskeys = /* GraphQL */ `mutation DeleteUserWhiskeys(
  $input: DeleteUserWhiskeysInput!
  $condition: ModelUserWhiskeysConditionInput
) {
  deleteUserWhiskeys(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUserWhiskeysMutationVariables,
  APITypes.DeleteUserWhiskeysMutation
>;
export const createUserTrendingWhiskeys = /* GraphQL */ `mutation CreateUserTrendingWhiskeys(
  $input: CreateUserTrendingWhiskeysInput!
  $condition: ModelUserTrendingWhiskeysConditionInput
) {
  createUserTrendingWhiskeys(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateUserTrendingWhiskeysMutationVariables,
  APITypes.CreateUserTrendingWhiskeysMutation
>;
export const updateUserTrendingWhiskeys = /* GraphQL */ `mutation UpdateUserTrendingWhiskeys(
  $input: UpdateUserTrendingWhiskeysInput!
  $condition: ModelUserTrendingWhiskeysConditionInput
) {
  updateUserTrendingWhiskeys(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUserTrendingWhiskeysMutationVariables,
  APITypes.UpdateUserTrendingWhiskeysMutation
>;
export const deleteUserTrendingWhiskeys = /* GraphQL */ `mutation DeleteUserTrendingWhiskeys(
  $input: DeleteUserTrendingWhiskeysInput!
  $condition: ModelUserTrendingWhiskeysConditionInput
) {
  deleteUserTrendingWhiskeys(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUserTrendingWhiskeysMutationVariables,
  APITypes.DeleteUserTrendingWhiskeysMutation
>;
export const createWhiskey = /* GraphQL */ `mutation CreateWhiskey(
  $input: CreateWhiskeyInput!
  $condition: ModelWhiskeyConditionInput
) {
  createWhiskey(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateWhiskeyMutationVariables,
  APITypes.CreateWhiskeyMutation
>;
export const updateWhiskey = /* GraphQL */ `mutation UpdateWhiskey(
  $input: UpdateWhiskeyInput!
  $condition: ModelWhiskeyConditionInput
) {
  updateWhiskey(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateWhiskeyMutationVariables,
  APITypes.UpdateWhiskeyMutation
>;
export const deleteWhiskey = /* GraphQL */ `mutation DeleteWhiskey(
  $input: DeleteWhiskeyInput!
  $condition: ModelWhiskeyConditionInput
) {
  deleteWhiskey(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteWhiskeyMutationVariables,
  APITypes.DeleteWhiskeyMutation
>;
export const createFeatureFlags = /* GraphQL */ `mutation CreateFeatureFlags(
  $input: CreateFeatureFlagsInput!
  $condition: ModelFeatureFlagsConditionInput
) {
  createFeatureFlags(input: $input, condition: $condition) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateFeatureFlagsMutationVariables,
  APITypes.CreateFeatureFlagsMutation
>;
export const updateFeatureFlags = /* GraphQL */ `mutation UpdateFeatureFlags(
  $input: UpdateFeatureFlagsInput!
  $condition: ModelFeatureFlagsConditionInput
) {
  updateFeatureFlags(input: $input, condition: $condition) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateFeatureFlagsMutationVariables,
  APITypes.UpdateFeatureFlagsMutation
>;
export const deleteFeatureFlags = /* GraphQL */ `mutation DeleteFeatureFlags(
  $input: DeleteFeatureFlagsInput!
  $condition: ModelFeatureFlagsConditionInput
) {
  deleteFeatureFlags(input: $input, condition: $condition) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteFeatureFlagsMutationVariables,
  APITypes.DeleteFeatureFlagsMutation
>;
export const createAppConfig = /* GraphQL */ `mutation CreateAppConfig(
  $input: CreateAppConfigInput!
  $condition: ModelAppConfigConditionInput
) {
  createAppConfig(input: $input, condition: $condition) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateAppConfigMutationVariables,
  APITypes.CreateAppConfigMutation
>;
export const updateAppConfig = /* GraphQL */ `mutation UpdateAppConfig(
  $input: UpdateAppConfigInput!
  $condition: ModelAppConfigConditionInput
) {
  updateAppConfig(input: $input, condition: $condition) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateAppConfigMutationVariables,
  APITypes.UpdateAppConfigMutation
>;
export const deleteAppConfig = /* GraphQL */ `mutation DeleteAppConfig(
  $input: DeleteAppConfigInput!
  $condition: ModelAppConfigConditionInput
) {
  deleteAppConfig(input: $input, condition: $condition) {
    id
    key
    value
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteAppConfigMutationVariables,
  APITypes.DeleteAppConfigMutation
>;
export const createReward = /* GraphQL */ `mutation CreateReward(
  $input: CreateRewardInput!
  $condition: ModelRewardConditionInput
) {
  createReward(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateRewardMutationVariables,
  APITypes.CreateRewardMutation
>;
export const updateReward = /* GraphQL */ `mutation UpdateReward(
  $input: UpdateRewardInput!
  $condition: ModelRewardConditionInput
) {
  updateReward(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateRewardMutationVariables,
  APITypes.UpdateRewardMutation
>;
export const deleteReward = /* GraphQL */ `mutation DeleteReward(
  $input: DeleteRewardInput!
  $condition: ModelRewardConditionInput
) {
  deleteReward(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteRewardMutationVariables,
  APITypes.DeleteRewardMutation
>;
export const createGuideTags = /* GraphQL */ `mutation CreateGuideTags(
  $input: CreateGuideTagsInput!
  $condition: ModelGuideTagsConditionInput
) {
  createGuideTags(input: $input, condition: $condition) {
    id
    name
    count
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateGuideTagsMutationVariables,
  APITypes.CreateGuideTagsMutation
>;
export const updateGuideTags = /* GraphQL */ `mutation UpdateGuideTags(
  $input: UpdateGuideTagsInput!
  $condition: ModelGuideTagsConditionInput
) {
  updateGuideTags(input: $input, condition: $condition) {
    id
    name
    count
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateGuideTagsMutationVariables,
  APITypes.UpdateGuideTagsMutation
>;
export const deleteGuideTags = /* GraphQL */ `mutation DeleteGuideTags(
  $input: DeleteGuideTagsInput!
  $condition: ModelGuideTagsConditionInput
) {
  deleteGuideTags(input: $input, condition: $condition) {
    id
    name
    count
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteGuideTagsMutationVariables,
  APITypes.DeleteGuideTagsMutation
>;
export const createGuides = /* GraphQL */ `mutation CreateGuides(
  $input: CreateGuidesInput!
  $condition: ModelGuidesConditionInput
) {
  createGuides(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateGuidesMutationVariables,
  APITypes.CreateGuidesMutation
>;
export const updateGuides = /* GraphQL */ `mutation UpdateGuides(
  $input: UpdateGuidesInput!
  $condition: ModelGuidesConditionInput
) {
  updateGuides(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateGuidesMutationVariables,
  APITypes.UpdateGuidesMutation
>;
export const deleteGuides = /* GraphQL */ `mutation DeleteGuides(
  $input: DeleteGuidesInput!
  $condition: ModelGuidesConditionInput
) {
  deleteGuides(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteGuidesMutationVariables,
  APITypes.DeleteGuidesMutation
>;
export const updateUserReward = /* GraphQL */ `mutation UpdateUserReward(
  $input: UpdateUserRewardInput!
  $condition: ModelUserRewardConditionInput
) {
  updateUserReward(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUserRewardMutationVariables,
  APITypes.UpdateUserRewardMutation
>;
export const createReview = /* GraphQL */ `mutation CreateReview(
  $input: CreateReviewInput!
  $condition: ModelReviewConditionInput
) {
  createReview(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateReviewMutationVariables,
  APITypes.CreateReviewMutation
>;
export const updateReview = /* GraphQL */ `mutation UpdateReview(
  $input: UpdateReviewInput!
  $condition: ModelReviewConditionInput
) {
  updateReview(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateReviewMutationVariables,
  APITypes.UpdateReviewMutation
>;
export const deleteReview = /* GraphQL */ `mutation DeleteReview(
  $input: DeleteReviewInput!
  $condition: ModelReviewConditionInput
) {
  deleteReview(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteReviewMutationVariables,
  APITypes.DeleteReviewMutation
>;
export const createSuggestion = /* GraphQL */ `mutation CreateSuggestion(
  $input: CreateSuggestionInput!
  $condition: ModelSuggestionConditionInput
) {
  createSuggestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateSuggestionMutationVariables,
  APITypes.CreateSuggestionMutation
>;
export const updateSuggestion = /* GraphQL */ `mutation UpdateSuggestion(
  $input: UpdateSuggestionInput!
  $condition: ModelSuggestionConditionInput
) {
  updateSuggestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateSuggestionMutationVariables,
  APITypes.UpdateSuggestionMutation
>;
export const deleteSuggestion = /* GraphQL */ `mutation DeleteSuggestion(
  $input: DeleteSuggestionInput!
  $condition: ModelSuggestionConditionInput
) {
  deleteSuggestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteSuggestionMutationVariables,
  APITypes.DeleteSuggestionMutation
>;
export const createComment = /* GraphQL */ `mutation CreateComment(
  $input: CreateCommentInput!
  $condition: ModelCommentConditionInput
) {
  createComment(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateCommentMutationVariables,
  APITypes.CreateCommentMutation
>;
export const updateComment = /* GraphQL */ `mutation UpdateComment(
  $input: UpdateCommentInput!
  $condition: ModelCommentConditionInput
) {
  updateComment(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateCommentMutationVariables,
  APITypes.UpdateCommentMutation
>;
export const deleteComment = /* GraphQL */ `mutation DeleteComment(
  $input: DeleteCommentInput!
  $condition: ModelCommentConditionInput
) {
  deleteComment(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteCommentMutationVariables,
  APITypes.DeleteCommentMutation
>;
export const createPost = /* GraphQL */ `mutation CreatePost(
  $input: CreatePostInput!
  $condition: ModelPostConditionInput
) {
  createPost(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreatePostMutationVariables,
  APITypes.CreatePostMutation
>;
export const updatePost = /* GraphQL */ `mutation UpdatePost(
  $input: UpdatePostInput!
  $condition: ModelPostConditionInput
) {
  updatePost(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdatePostMutationVariables,
  APITypes.UpdatePostMutation
>;
export const deletePost = /* GraphQL */ `mutation DeletePost(
  $input: DeletePostInput!
  $condition: ModelPostConditionInput
) {
  deletePost(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeletePostMutationVariables,
  APITypes.DeletePostMutation
>;
export const deleteNotification = /* GraphQL */ `mutation DeleteNotification(
  $input: DeleteNotificationInput!
  $condition: ModelNotificationConditionInput
) {
  deleteNotification(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteNotificationMutationVariables,
  APITypes.DeleteNotificationMutation
>;
export const createAdCampaign = /* GraphQL */ `mutation CreateAdCampaign(
  $input: CreateAdCampaignInput!
  $condition: ModelAdCampaignConditionInput
) {
  createAdCampaign(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateAdCampaignMutationVariables,
  APITypes.CreateAdCampaignMutation
>;
export const updateAdCampaign = /* GraphQL */ `mutation UpdateAdCampaign(
  $input: UpdateAdCampaignInput!
  $condition: ModelAdCampaignConditionInput
) {
  updateAdCampaign(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateAdCampaignMutationVariables,
  APITypes.UpdateAdCampaignMutation
>;
export const deleteAdCampaign = /* GraphQL */ `mutation DeleteAdCampaign(
  $input: DeleteAdCampaignInput!
  $condition: ModelAdCampaignConditionInput
) {
  deleteAdCampaign(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteAdCampaignMutationVariables,
  APITypes.DeleteAdCampaignMutation
>;
export const createReport = /* GraphQL */ `mutation CreateReport(
  $input: CreateReportInput!
  $condition: ModelReportConditionInput
) {
  createReport(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateReportMutationVariables,
  APITypes.CreateReportMutation
>;
export const updateReport = /* GraphQL */ `mutation UpdateReport(
  $input: UpdateReportInput!
  $condition: ModelReportConditionInput
) {
  updateReport(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateReportMutationVariables,
  APITypes.UpdateReportMutation
>;
export const deleteReport = /* GraphQL */ `mutation DeleteReport(
  $input: DeleteReportInput!
  $condition: ModelReportConditionInput
) {
  deleteReport(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteReportMutationVariables,
  APITypes.DeleteReportMutation
>;
export const createUpdatePostLikesResult = /* GraphQL */ `mutation CreateUpdatePostLikesResult(
  $input: CreateUpdatePostLikesResultInput!
  $condition: ModelUpdatePostLikesResultConditionInput
) {
  createUpdatePostLikesResult(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateUpdatePostLikesResultMutationVariables,
  APITypes.CreateUpdatePostLikesResultMutation
>;
export const updateUpdatePostLikesResult = /* GraphQL */ `mutation UpdateUpdatePostLikesResult(
  $input: UpdateUpdatePostLikesResultInput!
  $condition: ModelUpdatePostLikesResultConditionInput
) {
  updateUpdatePostLikesResult(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUpdatePostLikesResultMutationVariables,
  APITypes.UpdateUpdatePostLikesResultMutation
>;
export const deleteUpdatePostLikesResult = /* GraphQL */ `mutation DeleteUpdatePostLikesResult(
  $input: DeleteUpdatePostLikesResultInput!
  $condition: ModelUpdatePostLikesResultConditionInput
) {
  deleteUpdatePostLikesResult(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUpdatePostLikesResultMutationVariables,
  APITypes.DeleteUpdatePostLikesResultMutation
>;
export const createCMSUser = /* GraphQL */ `mutation CreateCMSUser(
  $input: CreateCMSUserInput!
  $condition: ModelCMSUserConditionInput
) {
  createCMSUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateCMSUserMutationVariables,
  APITypes.CreateCMSUserMutation
>;
export const updateCMSUser = /* GraphQL */ `mutation UpdateCMSUser(
  $input: UpdateCMSUserInput!
  $condition: ModelCMSUserConditionInput
) {
  updateCMSUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateCMSUserMutationVariables,
  APITypes.UpdateCMSUserMutation
>;
export const deleteCMSUser = /* GraphQL */ `mutation DeleteCMSUser(
  $input: DeleteCMSUserInput!
  $condition: ModelCMSUserConditionInput
) {
  deleteCMSUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteCMSUserMutationVariables,
  APITypes.DeleteCMSUserMutation
>;
export const createCMSUserBrand = /* GraphQL */ `mutation CreateCMSUserBrand(
  $input: CreateCMSUserBrandInput!
  $condition: ModelCMSUserBrandConditionInput
) {
  createCMSUserBrand(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateCMSUserBrandMutationVariables,
  APITypes.CreateCMSUserBrandMutation
>;
export const updateCMSUserBrand = /* GraphQL */ `mutation UpdateCMSUserBrand(
  $input: UpdateCMSUserBrandInput!
  $condition: ModelCMSUserBrandConditionInput
) {
  updateCMSUserBrand(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateCMSUserBrandMutationVariables,
  APITypes.UpdateCMSUserBrandMutation
>;
export const deleteCMSUserBrand = /* GraphQL */ `mutation DeleteCMSUserBrand(
  $input: DeleteCMSUserBrandInput!
  $condition: ModelCMSUserBrandConditionInput
) {
  deleteCMSUserBrand(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteCMSUserBrandMutationVariables,
  APITypes.DeleteCMSUserBrandMutation
>;
export const createAppVersion = /* GraphQL */ `mutation CreateAppVersion(
  $input: CreateAppVersionInput!
  $condition: ModelAppVersionConditionInput
) {
  createAppVersion(input: $input, condition: $condition) {
    id
    platform
    currentVersion
    minimumVersion
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateAppVersionMutationVariables,
  APITypes.CreateAppVersionMutation
>;
export const updateAppVersion = /* GraphQL */ `mutation UpdateAppVersion(
  $input: UpdateAppVersionInput!
  $condition: ModelAppVersionConditionInput
) {
  updateAppVersion(input: $input, condition: $condition) {
    id
    platform
    currentVersion
    minimumVersion
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateAppVersionMutationVariables,
  APITypes.UpdateAppVersionMutation
>;
export const deleteAppVersion = /* GraphQL */ `mutation DeleteAppVersion(
  $input: DeleteAppVersionInput!
  $condition: ModelAppVersionConditionInput
) {
  deleteAppVersion(input: $input, condition: $condition) {
    id
    platform
    currentVersion
    minimumVersion
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteAppVersionMutationVariables,
  APITypes.DeleteAppVersionMutation
>;
export const createClub = /* GraphQL */ `mutation CreateClub(
  $input: CreateClubInput!
  $condition: ModelClubConditionInput
) {
  createClub(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateClubMutationVariables,
  APITypes.CreateClubMutation
>;
export const updateClub = /* GraphQL */ `mutation UpdateClub(
  $input: UpdateClubInput!
  $condition: ModelClubConditionInput
) {
  updateClub(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateClubMutationVariables,
  APITypes.UpdateClubMutation
>;
export const deleteClub = /* GraphQL */ `mutation DeleteClub(
  $input: DeleteClubInput!
  $condition: ModelClubConditionInput
) {
  deleteClub(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteClubMutationVariables,
  APITypes.DeleteClubMutation
>;
export const createClubMember = /* GraphQL */ `mutation CreateClubMember(
  $input: CreateClubMemberInput!
  $condition: ModelClubMemberConditionInput
) {
  createClubMember(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateClubMemberMutationVariables,
  APITypes.CreateClubMemberMutation
>;
export const updateClubMember = /* GraphQL */ `mutation UpdateClubMember(
  $input: UpdateClubMemberInput!
  $condition: ModelClubMemberConditionInput
) {
  updateClubMember(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateClubMemberMutationVariables,
  APITypes.UpdateClubMemberMutation
>;
export const deleteClubMember = /* GraphQL */ `mutation DeleteClubMember(
  $input: DeleteClubMemberInput!
  $condition: ModelClubMemberConditionInput
) {
  deleteClubMember(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteClubMemberMutationVariables,
  APITypes.DeleteClubMemberMutation
>;
export const createClubWhiskey = /* GraphQL */ `mutation CreateClubWhiskey(
  $input: CreateClubWhiskeyInput!
  $condition: ModelClubWhiskeyConditionInput
) {
  createClubWhiskey(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateClubWhiskeyMutationVariables,
  APITypes.CreateClubWhiskeyMutation
>;
export const updateClubWhiskey = /* GraphQL */ `mutation UpdateClubWhiskey(
  $input: UpdateClubWhiskeyInput!
  $condition: ModelClubWhiskeyConditionInput
) {
  updateClubWhiskey(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateClubWhiskeyMutationVariables,
  APITypes.UpdateClubWhiskeyMutation
>;
export const deleteClubWhiskey = /* GraphQL */ `mutation DeleteClubWhiskey(
  $input: DeleteClubWhiskeyInput!
  $condition: ModelClubWhiskeyConditionInput
) {
  deleteClubWhiskey(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteClubWhiskeyMutationVariables,
  APITypes.DeleteClubWhiskeyMutation
>;
export const createClubRequest = /* GraphQL */ `mutation CreateClubRequest(
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
` as GeneratedMutation<
  APITypes.CreateClubRequestMutationVariables,
  APITypes.CreateClubRequestMutation
>;
export const updateClubRequest = /* GraphQL */ `mutation UpdateClubRequest(
  $input: UpdateClubRequestInput!
  $condition: ModelClubRequestConditionInput
) {
  updateClubRequest(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateClubRequestMutationVariables,
  APITypes.UpdateClubRequestMutation
>;
export const deleteClubRequest = /* GraphQL */ `mutation DeleteClubRequest(
  $input: DeleteClubRequestInput!
  $condition: ModelClubRequestConditionInput
) {
  deleteClubRequest(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteClubRequestMutationVariables,
  APITypes.DeleteClubRequestMutation
>;
export const createConversation = /* GraphQL */ `mutation CreateConversation(
  $input: CreateConversationInput!
  $condition: ModelConversationConditionInput
) {
  createConversation(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateConversationMutationVariables,
  APITypes.CreateConversationMutation
>;
export const updateConversation = /* GraphQL */ `mutation UpdateConversation(
  $input: UpdateConversationInput!
  $condition: ModelConversationConditionInput
) {
  updateConversation(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateConversationMutationVariables,
  APITypes.UpdateConversationMutation
>;
export const deleteConversation = /* GraphQL */ `mutation DeleteConversation(
  $input: DeleteConversationInput!
  $condition: ModelConversationConditionInput
) {
  deleteConversation(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteConversationMutationVariables,
  APITypes.DeleteConversationMutation
>;
export const createConversationParticipant = /* GraphQL */ `mutation CreateConversationParticipant(
  $input: CreateConversationParticipantInput!
  $condition: ModelConversationParticipantConditionInput
) {
  createConversationParticipant(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateConversationParticipantMutationVariables,
  APITypes.CreateConversationParticipantMutation
>;
export const updateConversationParticipant = /* GraphQL */ `mutation UpdateConversationParticipant(
  $input: UpdateConversationParticipantInput!
  $condition: ModelConversationParticipantConditionInput
) {
  updateConversationParticipant(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateConversationParticipantMutationVariables,
  APITypes.UpdateConversationParticipantMutation
>;
export const deleteConversationParticipant = /* GraphQL */ `mutation DeleteConversationParticipant(
  $input: DeleteConversationParticipantInput!
  $condition: ModelConversationParticipantConditionInput
) {
  deleteConversationParticipant(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteConversationParticipantMutationVariables,
  APITypes.DeleteConversationParticipantMutation
>;
export const updateMessage = /* GraphQL */ `mutation UpdateMessage(
  $input: UpdateMessageInput!
  $condition: ModelMessageConditionInput
) {
  updateMessage(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateMessageMutationVariables,
  APITypes.UpdateMessageMutation
>;
export const deleteMessage = /* GraphQL */ `mutation DeleteMessage(
  $input: DeleteMessageInput!
  $condition: ModelMessageConditionInput
) {
  deleteMessage(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteMessageMutationVariables,
  APITypes.DeleteMessageMutation
>;
export const createUserLikes = /* GraphQL */ `mutation CreateUserLikes(
  $input: CreateUserLikesInput!
  $condition: ModelUserLikesConditionInput
) {
  createUserLikes(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateUserLikesMutationVariables,
  APITypes.CreateUserLikesMutation
>;
export const updateUserLikes = /* GraphQL */ `mutation UpdateUserLikes(
  $input: UpdateUserLikesInput!
  $condition: ModelUserLikesConditionInput
) {
  updateUserLikes(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUserLikesMutationVariables,
  APITypes.UpdateUserLikesMutation
>;
export const deleteUserLikes = /* GraphQL */ `mutation DeleteUserLikes(
  $input: DeleteUserLikesInput!
  $condition: ModelUserLikesConditionInput
) {
  deleteUserLikes(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUserLikesMutationVariables,
  APITypes.DeleteUserLikesMutation
>;
export const createUserWishListWhiskeys = /* GraphQL */ `mutation CreateUserWishListWhiskeys(
  $input: CreateUserWishListWhiskeysInput!
  $condition: ModelUserWishListWhiskeysConditionInput
) {
  createUserWishListWhiskeys(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateUserWishListWhiskeysMutationVariables,
  APITypes.CreateUserWishListWhiskeysMutation
>;
export const updateUserWishListWhiskeys = /* GraphQL */ `mutation UpdateUserWishListWhiskeys(
  $input: UpdateUserWishListWhiskeysInput!
  $condition: ModelUserWishListWhiskeysConditionInput
) {
  updateUserWishListWhiskeys(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUserWishListWhiskeysMutationVariables,
  APITypes.UpdateUserWishListWhiskeysMutation
>;
export const deleteUserWishListWhiskeys = /* GraphQL */ `mutation DeleteUserWishListWhiskeys(
  $input: DeleteUserWishListWhiskeysInput!
  $condition: ModelUserWishListWhiskeysConditionInput
) {
  deleteUserWishListWhiskeys(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUserWishListWhiskeysMutationVariables,
  APITypes.DeleteUserWishListWhiskeysMutation
>;
export const createUserFavoriteGuides = /* GraphQL */ `mutation CreateUserFavoriteGuides(
  $input: CreateUserFavoriteGuidesInput!
  $condition: ModelUserFavoriteGuidesConditionInput
) {
  createUserFavoriteGuides(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateUserFavoriteGuidesMutationVariables,
  APITypes.CreateUserFavoriteGuidesMutation
>;
export const updateUserFavoriteGuides = /* GraphQL */ `mutation UpdateUserFavoriteGuides(
  $input: UpdateUserFavoriteGuidesInput!
  $condition: ModelUserFavoriteGuidesConditionInput
) {
  updateUserFavoriteGuides(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUserFavoriteGuidesMutationVariables,
  APITypes.UpdateUserFavoriteGuidesMutation
>;
export const deleteUserFavoriteGuides = /* GraphQL */ `mutation DeleteUserFavoriteGuides(
  $input: DeleteUserFavoriteGuidesInput!
  $condition: ModelUserFavoriteGuidesConditionInput
) {
  deleteUserFavoriteGuides(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUserFavoriteGuidesMutationVariables,
  APITypes.DeleteUserFavoriteGuidesMutation
>;
export const sendCMSUserInvitation = /* GraphQL */ `mutation SendCMSUserInvitation(
  $email: String!
  $role: CMSUserRole!
  $brandIds: [String]
) {
  sendCMSUserInvitation(email: $email, role: $role, brandIds: $brandIds) {
    success
    authId
    message
    __typename
  }
}
` as GeneratedMutation<
  APITypes.SendCMSUserInvitationMutationVariables,
  APITypes.SendCMSUserInvitationMutation
>;
export const createCMSUserWithAuth = /* GraphQL */ `mutation CreateCMSUserWithAuth(
  $email: String!
  $role: CMSUserRole!
  $brandId: String
) {
  createCMSUserWithAuth(email: $email, role: $role, brandId: $brandId) {
    statusCode
    success
    message
    cmsUserId
    authId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateCMSUserWithAuthMutationVariables,
  APITypes.CreateCMSUserWithAuthMutation
>;
export const updateCMSUserWithAuth = /* GraphQL */ `mutation UpdateCMSUserWithAuth(
  $userId: String!
  $email: String
  $role: String
  $isActive: Boolean
  $brandIds: [String]
) {
  updateCMSUserWithAuth(
    userId: $userId
    email: $email
    role: $role
    isActive: $isActive
    brandIds: $brandIds
  ) {
    statusCode
    success
    message
    updatedUser {
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
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateCMSUserWithAuthMutationVariables,
  APITypes.UpdateCMSUserWithAuthMutation
>;
export const createUser = /* GraphQL */ `mutation CreateUser(
  $id: ID!
  $username: String!
  $firstName: String
  $lastName: String
  $venueName: String
  $phone: String
  $street: String
  $city: String
  $state: String
  $number: String
  $geoPoint: GeoPointInput
  $userType: UserType!
  $venueMenu: S3ObjectInput
  $brandName: String
  $brandDescription: String
  $brandWebsite: String
  $brandCountry: String
  $brandFoundedYear: Int
  $brandStory: String
) {
  createUser(
    id: $id
    username: $username
    firstName: $firstName
    lastName: $lastName
    venueName: $venueName
    phone: $phone
    street: $street
    city: $city
    state: $state
    number: $number
    geoPoint: $geoPoint
    userType: $userType
    venueMenu: $venueMenu
    brandName: $brandName
    brandDescription: $brandDescription
    brandWebsite: $brandWebsite
    brandCountry: $brandCountry
    brandFoundedYear: $brandFoundedYear
    brandStory: $brandStory
  )
}
` as GeneratedMutation<
  APITypes.CreateUserMutationVariables,
  APITypes.CreateUserMutation
>;
export const followUser = /* GraphQL */ `mutation FollowUser($user: ID!) {
  followUser(user: $user)
}
` as GeneratedMutation<
  APITypes.FollowUserMutationVariables,
  APITypes.FollowUserMutation
>;
export const unfollowUser = /* GraphQL */ `mutation UnfollowUser($user: ID!) {
  unfollowUser(user: $user)
}
` as GeneratedMutation<
  APITypes.UnfollowUserMutationVariables,
  APITypes.UnfollowUserMutation
>;
export const deleteUserNotifications = /* GraphQL */ `mutation DeleteUserNotifications {
  deleteUserNotifications
}
` as GeneratedMutation<
  APITypes.DeleteUserNotificationsMutationVariables,
  APITypes.DeleteUserNotificationsMutation
>;
export const setUserIsOnRewards = /* GraphQL */ `mutation SetUserIsOnRewards {
  setUserIsOnRewards
}
` as GeneratedMutation<
  APITypes.SetUserIsOnRewardsMutationVariables,
  APITypes.SetUserIsOnRewardsMutation
>;
export const createVenue = /* GraphQL */ `mutation CreateVenue($input: CreateVenueInput!) {
  createVenue(input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateVenueMutationVariables,
  APITypes.CreateVenueMutation
>;
export const transferVenue = /* GraphQL */ `mutation TransferVenue($id: ID!, $email: String!, $token: String!) {
  transferVenue(id: $id, email: $email, token: $token)
}
` as GeneratedMutation<
  APITypes.TransferVenueMutationVariables,
  APITypes.TransferVenueMutation
>;
export const transferBrand = /* GraphQL */ `mutation TransferBrand($id: ID!, $email: String!, $owner: String!) {
  transferBrand(id: $id, email: $email, owner: $owner)
}
` as GeneratedMutation<
  APITypes.TransferBrandMutationVariables,
  APITypes.TransferBrandMutation
>;
export const updateVenue = /* GraphQL */ `mutation UpdateVenue($input: UpdateVenueInput) {
  updateVenue(input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateVenueMutationVariables,
  APITypes.UpdateVenueMutation
>;
export const deleteVenue = /* GraphQL */ `mutation DeleteVenue($input: DeleteVenueInput) {
  deleteVenue(input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteVenueMutationVariables,
  APITypes.DeleteVenueMutation
>;
export const createBrandV2 = /* GraphQL */ `mutation CreateBrandV2($input: CreateBrandV2Input!) {
  createBrandV2(input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateBrandV2MutationVariables,
  APITypes.CreateBrandV2Mutation
>;
export const updatePostLikes = /* GraphQL */ `mutation UpdatePostLikes($input: UpdatePostLikesInput!) {
  updatePostLikes(input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdatePostLikesMutationVariables,
  APITypes.UpdatePostLikesMutation
>;
export const deleteClubPostAdmin = /* GraphQL */ `mutation DeleteClubPostAdmin($postId: ID!) {
  deleteClubPostAdmin(postId: $postId) {
    success
    postId
    message
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteClubPostAdminMutationVariables,
  APITypes.DeleteClubPostAdminMutation
>;
export const deleteClubAdmin = /* GraphQL */ `mutation DeleteClubAdmin($input: DeleteClubAdminInput!) {
  deleteClubAdmin(input: $input) {
    success
    clubId
    clubName
    deletedCounts {
      members
      whiskeys
      posts
      __typename
    }
    message
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteClubAdminMutationVariables,
  APITypes.DeleteClubAdminMutation
>;
export const deleteAdCampaignAdmin = /* GraphQL */ `mutation DeleteAdCampaignAdmin($input: DeleteAdCampaignAdminInput!) {
  deleteAdCampaignAdmin(input: $input) {
    success
    campaignId
    campaignName
    deletedCounts {
      eventRecords
      s3Objects
      __typename
    }
    message
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteAdCampaignAdminMutationVariables,
  APITypes.DeleteAdCampaignAdminMutation
>;
export const sendMessage = /* GraphQL */ `mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    messageId
    conversationId
    text
    senderId
    createdAt
    isNewConversation
    __typename
  }
}
` as GeneratedMutation<
  APITypes.SendMessageMutationVariables,
  APITypes.SendMessageMutation
>;
export const updateMessageRequest = /* GraphQL */ `mutation UpdateMessageRequest($input: UpdateMessageRequestInput!) {
  updateMessageRequest(input: $input) {
    success
    participantId
    conversationId
    requestStatus
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateMessageRequestMutationVariables,
  APITypes.UpdateMessageRequestMutation
>;
export const markMessagesAsRead = /* GraphQL */ `mutation MarkMessagesAsRead($input: MarkMessagesAsReadInput!) {
  markMessagesAsRead(input: $input) {
    success
    conversationId
    readAt
    updatedMessageCount
    __typename
  }
}
` as GeneratedMutation<
  APITypes.MarkMessagesAsReadMutationVariables,
  APITypes.MarkMessagesAsReadMutation
>;
export const softDeleteMessage = /* GraphQL */ `mutation SoftDeleteMessage($input: SoftDeleteMessageInput!) {
  softDeleteMessage(input: $input) {
    success
    messageId
    conversationId
    deleteForEveryone
    __typename
  }
}
` as GeneratedMutation<
  APITypes.SoftDeleteMessageMutationVariables,
  APITypes.SoftDeleteMessageMutation
>;
export const identifyWhiskeyFromImage = /* GraphQL */ `mutation IdentifyWhiskeyFromImage($input: IdentifyWhiskeyInput!) {
  identifyWhiskeyFromImage(input: $input) {
    isWhiskeyDetected
    extractedInfo {
      brand
      name
      fullLabelText
      age
      proof
      type
      distillery
      origin
      visionConfidence
      __typename
    }
    matches {
      whiskeyId
      name
      fullName
      brand
      age
      proof
      type
      distillery
      confidence
      __typename
    }
    rateLimitExceeded
    error
    message
    __typename
  }
}
` as GeneratedMutation<
  APITypes.IdentifyWhiskeyFromImageMutationVariables,
  APITypes.IdentifyWhiskeyFromImageMutation
>;
export const deleteScanImage = /* GraphQL */ `mutation DeleteScanImage($input: DeleteScanImageInput!) {
  deleteScanImage(input: $input) {
    success
    error
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteScanImageMutationVariables,
  APITypes.DeleteScanImageMutation
>;
