type FieldTypes = {
  [index: string]: string;
};
const fieldTypes: FieldTypes = {
  whiskey: `
    id
    name
    fullName
    brand
    brandId
    brandUser {
      id
      brandName
      brandSearchName
      brandDescription
      brandLogo {
        bucket
        key
        region
      }
      coverPicture {
        bucket
        key
        region
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
      }
      coverPicture {
        bucket
        key
        region
      }
      bio
    }
    brandPicture {
      bucket
      key
      region
    }
    description
    distillery
    age
    barrel
    batch
    bottle
    proof
    proofType
    origin
    picture {
      bucket
      key
      region
    }
    awards {
      picture {
        bucket
        key
        region
      }
      title
      year
    }
    rick
    specialistChoice
    starterPick
    singleBarrel
    storePick
    calculatedRating
    distilleryTastingNotes
    type
  `,
  userReward: `
    address
    city
    email
    fullName
    id
    isAlreadyViewed
    isCompleted
    isRedeemed
    lastScoreUpdate
    model
    owner
    rewardId
    reward {
      photo {
        bucket
        key
        region
      }
      models
      sizes
      description
      title
      id
    }
    rewardUsersId
    score
    service
    size
    state
    trackingCode
    userId
    userRewardsId
    zipcode
    `,
  reward: `
    id
    title
    conditions {
      key
      value
    }
    createdAt
    description
    isAvailable
    models
    photo {
      bucket
      key
      region
    }
    sizes
    updatedAt
  `,
  adCampaign: `
    id
    createdAt
    endDate
    isActive
    name
    owner
    picture {
      bucket
      key
      region
    }
    startDate
    type
    updatedAt
    url
  `,
  events: `
    id
    interactions
    impressions
    campaign
  `,
  tastingEvent: `
    id
    title
    description
    image {
      bucket
      key
      region
    }
    mapImage {
      bucket
      key
      region
    }
    hostBoothNumber
    status
    publishAt
    startsAt
    endsAt
    createdAt
    updatedAt
  `,
  tastingBooth: `
    id
    eventId
    event {
      id
      title
    }
    brandRefId
    brandSyncedAt
    name
    logo {
      bucket
      key
      region
    }
    description
    location
    boothNumber
    order
    createdAt
    updatedAt
  `,
  tastingPour: `
    id
    boothId
    booth {
      id
      name
    }
    whiskeyRefId
    bottleKey
    name
    brand
    tag
    proof
    rating
    picture {
      bucket
      key
      region
    }
    order
    createdAt
    updatedAt
  `,
  // Per-attendee passport rows. Owner-auth models, readable here because the CMS
  // signs in as an Admin-group user. `id` carries the owner sub as its first
  // segment (`${sub}:${eventId}:${boothId}`), which is how a state row is joined
  // back to its attendance record without exposing the User table.
  tastingBoothState: `
    id
    eventId
    boothId
    want
    went
    fav
    shareEmail
  `,
  tastingPourState: `
    id
    eventId
    boothId
    pourId
    bottleKey
    tasted
    fav
  `,
  tastingAttendance: `
    id
    eventId
    displayName
    email
    shareContact
    joinedAt
  `,
  suggestion: `
    id
    name
    createdAt
    updatedAt
    brand
    barcode
    photo {
      bucket
      key
      region
    }
    year
    userId
  `,
  report: `
    contentId
    contentType
    createdAt
    description
    id
    reason
    reportedUserId
    updatedAt
    userReportsId
  `,
  article: `
    id
    body
    coverPhoto {
      bucket
      key
      region
    }
    photos {
      bucket
      key
      region
    }
    subtitle
    tag
    title
  `,
  featureFlags: `
    id
    key
    value
    allowedUserIds
  `,
  appConfig: `
    id
    key
    value
  `,
  post: `
    author {
      username
    }
    authorId
    description
    photo {
      bucket
      key
      region
    }
    title
    references {
      id
      name
      type
    }
    likesCount
    locationId
    owner
    id
  `,
  comment: `
    id
    authorId
    author {
      username
    }
    owner
    postId
    text
  `,
  review: `
    description
    id
    rating
    recommendationTags
    specialistImage {
      bucket
      key
      region
    }
    whiskey {
      fullName
    }
    specialistName
    specialistReview
    title
    whiskeyId
    user {
      username
    }
  `,
  venue: `
    id
    owner
    bio
    coverPicture {
      bucket
      key
      region
    }
    profilePicture {
      bucket
      key
      region
    }
    userType
    username
    venueAddressCity
    venueAddressCountry
    venueAddressNumber
    venueAddressState
    venueAddressStreet
    venueCalculatedRating
    venueCheckinsCount
    venueName
    venueSearchName
    venuePhone
    toBeRedeemed
    externalId
    brandId
  `,
  venueRequest: `
  id
  createdAt
  email
  fullName
  status
  updatedAt
  username
  venuePhone
  venueName
  venueId
  venueAddressStreet
  venueAddressState
  venueAddressNumber
  venueAddressCountry
  venueAddressCity
  `,
  CMSUser: `
    id
    authId
    email
    role
    brandIds
    isActive
    createdAt
    updatedAt
    brands {
      items {
        id
        brandUserId
        assignedAt
        assignedBy
        brandUser {
          id
          username
          brandName
          brandSearchName
          bio
        }
      }
    }
  `,
  CMSUserBrand: `
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
  `,
  brand: `
    id
    owner
    brandName
    brandSearchName
    brandDescription
    brandLogo {
      bucket
      key
      region
    }
    coverPicture {
      bucket
      key
      region
    }
    brandWebsite
    brandCountry
    brandFoundedYear
    brandStory
    userType
    username
    bio
    toBeRedeemed
    createdAt
    updatedAt
  `,
  club: `
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
    memberCount
    whiskeyCount
    pinnedPostId
    clubMembers(filter: { role: { eq: CLUBOWNERROLE } }) {
      items {
        id
        role
        userId
        user {
          id
          username
        }
      }
    }
  `,
  clubMember: `
    id
    clubId
    userId
    role
    status
    joinedAt
    requestedAt
    createdAt
    updatedAt
    user {
      id
      username
      personFullName
      profilePicture {
        bucket
        key
        region
      }
      userType
    }
  `,
  clubWhiskey: `
    id
    clubId
    whiskeyId
    addedBy
    addedAt
    createdAt
    updatedAt
  `,
  clubRequest: `
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
      username
      profilePicture {
        bucket
        key
        region
      }
    }
    reviewer {
      id
      email
      role
    }
    createdClub {
      id
      clubName
      profilePicture
    }
  `,
  user: `
    id
    username
    personFullName
    venueName
    brandName
    profilePicture {
      bucket
      key
      region
    }
    userType
  `,
};

enum WhiskeyType {
  BOURBON = 'BOURBON',
  RYE = 'RYE',
  AMERICAN = 'AMERICAN',
  CANADIAN = 'CANADIAN',
  IRISH = 'IRISH',
  FLAVORED = 'FLAVORED',
  JAPANESE = 'JAPANESE',
  SINGLE_MALT_SCOTCH = 'SINGLE_MALT_SCOTCH',
  SINGLE_MALT_AMERICAN = 'SINGLE_MALT_AMERICAN',
  BLENDED_SCOTCH_AND_WO = 'BLENDED_SCOTCH_AND_WO',
  TN_WHISKEY = 'TN_WHISKEY',
  WORLD = 'WORLD',
  MALT = 'MALT',
  SCOTCH = 'SCOTCH',
  TEQUILA = 'TEQUILA',
  TEQUILA_REPOSADO = 'TEQUILA_REPOSADO',
  TEQUILA_ANEJO = 'TEQUILA_ANEJO',
  VINTAGE_SPIRITS = 'VINTAGE_SPIRITS',
}

enum AdType {
  ACTIVITY = 'ACTIVITY',
  DISCOVERY = 'DISCOVERY',
  SPONSORED = 'SPONSORED',
  ARTICLE = 'ARTICLE',
}

enum UserType {
  VENUE = 'VENUE',
  PERSON = 'PERSON',
  BRAND = 'BRAND',
}

enum RewardSize {
  large = 'large',
  medium = 'medium',
  small = 'small',
}

enum ReviewRecommendationTagsType {
  OAKY = 'OAKY',
  FRUITY = 'FRUITY',
  NUTTY = 'NUTTY',
  BRINY = 'BRINY',
  BUTTERY = 'BUTTERY',
  SPICY = 'SPICY',
  SMOKY = 'SMOKY',
  EARTHY = 'EARTHY',
  HERBAL = 'HERBAL',
  RICH = 'RICH',
  SILKY = 'SILKY',
}

enum VenueRequestStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  FINISHED = 'FINISHED',
}

enum ClubRole {
  CLUBOWNERROLE = 'CLUBOWNERROLE',
  CLUBADMINROLE = 'CLUBADMINROLE',
  CLUBMEMBERROLE = 'CLUBMEMBERROLE',
}

enum MemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED',
}

enum ClubRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

enum ProofType {
  NUMERIC = 'NUMERIC',
  CASK_STRENGTH = 'CASK_STRENGTH',
  BARREL_PROOF = 'BARREL_PROOF',
  FULL_PROOF = 'FULL_PROOF',
}

enum ModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ERROR = 'ERROR',
}

enum NotificationTypes {
  ACTIVITY = 'ACTIVITY',
  DISCOVERY = 'DISCOVERY',
  MYBAR = 'MYBAR',
  CLUB_REQUEST_APPROVED = 'CLUB_REQUEST_APPROVED',
  CLUB_REQUEST_REJECTED = 'CLUB_REQUEST_REJECTED',
  CLUB_MEMBER_REMOVED = 'CLUB_MEMBER_REMOVED',
  CLUB_PROMOTED_TO_ADMIN = 'CLUB_PROMOTED_TO_ADMIN',
  CLUB_JOIN_REQUEST = 'CLUB_JOIN_REQUEST',
  CLUB_POST_TAG = 'CLUB_POST_TAG',
  CLUB_POST_PINNED = 'CLUB_POST_PINNED',
  CLUB_WHISKEY_ADDED = 'CLUB_WHISKEY_ADDED',
}

enum ReferenceType {
  USER = 'USER',
  WHISKEY = 'WHISKEY',
}

enum InlineTagType {
  USER = 'USER',
  VENUE = 'VENUE',
  BRAND = 'BRAND',
  WHISKEY = 'WHISKEY',
}

enum ReportContentType {
  POST = 'POST',
  REVIEW = 'REVIEW',
  COMMENT = 'COMMENT',
}

enum PostLikeAction {
  like = 'like',
  unlike = 'unlike',
  sync = 'sync',
}

enum CMSUserRole {
  Admin = 'Admin',
  BrandOwner = 'BrandOwner',
  BrandEditor = 'BrandEditor',
}

const PROOF_TYPE_LABELS: Record<ProofType, string> = {
  [ProofType.NUMERIC]: 'Proof',
  [ProofType.CASK_STRENGTH]: 'Cask Strength',
  [ProofType.BARREL_PROOF]: 'Barrel Proof',
  [ProofType.FULL_PROOF]: 'Full Proof',
};

export const getProofDisplayValue = (item?: {
  proof?: number | null;
  proofType?: ProofType | null;
} | null): string | number => {
  if (!item) return '';

  if (item.proofType === ProofType.NUMERIC && item.proof != null) {
    return item.proof;
  }
  if (item.proofType && item.proofType !== ProofType.NUMERIC) {
    return PROOF_TYPE_LABELS[item.proofType];
  }

  // Legacy items without proofType
  if (item.proof != null) {
    return item.proof;
  }

  return '';
};

export type Article = {
  id: string;
  title: string;
  subtitle: string;
  coverPhoto: S3Object;
  tag: string;
  body: Array<string | null>;
  photos: Array<S3Object | null>;
  createdAt: string;
  updatedAt: string;
};

export type S3Object = {
  bucket: string;
  key: string;
  region: string;
};

export {
  AdType,
  ClubRole,
  ClubRequestStatus,
  CMSUserRole,
  InlineTagType,
  MemberStatus,
  ModerationStatus,
  NotificationTypes,
  PostLikeAction,
  ProofType,
  ReferenceType,
  ReportContentType,
  ReviewRecommendationTagsType,
  RewardSize,
  UserType,
  VenueRequestStatus,
  WhiskeyType,
  fieldTypes,
};
