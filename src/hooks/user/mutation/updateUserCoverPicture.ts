import { gql } from 'graphql-request';

const UpdateUserCoverPicture = gql`
  mutation UpdateUserCoverPicture($id: ID!, $coverPicture: S3ObjectInput, $coverPictureKey: String, $coverPictureModerationStatus: ModerationStatus) {
    updateUser(input: { id: $id, coverPicture: $coverPicture, coverPictureKey: $coverPictureKey, coverPictureModerationStatus: $coverPictureModerationStatus }) {
      id
    }
  }
`;

export { UpdateUserCoverPicture };
