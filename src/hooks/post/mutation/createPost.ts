import { gql } from 'graphql-request';

const CreatePost = gql`
  mutation CreatePost(
    $references: [ReferenceInput]
    $description: String
    $authorId: ID!
    $photo: S3ObjectInput
    $photoKey: String
    $photoModerationStatus: ModerationStatus
    $photos: [S3ObjectInput]
    $photoKeys: [String]
    $photoWidths: [Int]
    $photoHeights: [Int]
    $title: String
    $locationId: String
    $inlineTags: [InlineTagInput]
    $clubId: ID
    $clubIsPrivate: Boolean
  ) {
    createPost(
      input: {
        authorId: $authorId
        description: $description
        references: $references
        title: $title
        photo: $photo
        photoKey: $photoKey
        photoModerationStatus: $photoModerationStatus
        photos: $photos
        photoKeys: $photoKeys
        photoWidths: $photoWidths
        photoHeights: $photoHeights
        locationId: $locationId
        inlineTags: $inlineTags
        likesCount: 0
        clubId: $clubId
        clubIsPrivate: $clubIsPrivate
      }
    ) {
      id
      description
      authorId
      photo {
        bucket
        key
        region
        width
        height
      }
      photoModerationStatus
      photos {
        bucket
        key
        region
        width
        height
      }
      photoKeys
      photoWidths
      photoHeights
      likesCount
      inlineTags {
        id
        type
        entityId
        text
        startIndex
        endIndex
      }
      clubId
      clubIsPrivate
      createdAt
      updatedAt
      userPostsId
      owner
    }
  }
`;

export { CreatePost };
