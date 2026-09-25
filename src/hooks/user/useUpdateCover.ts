import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { ModerationStatus, User } from '@types';
import { useMutation } from '@tanstack/react-query';
import awsconfig from '../../config/aws';
import { UpdateUserCoverPicture } from './mutation/updateUserCoverPicture';

const useUpdateCover = () => {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<User, unknown, string>({
    mutationFn: async (data) => {
      const { updateUser } = await amplify.request<{ updateUser: User }>(
        UpdateUserCoverPicture,
        {
          id: sub,
          coverPicture: {
            key: data,
            bucket: awsconfig.aws_user_files_s3_bucket,
            region: awsconfig.aws_user_files_s3_bucket_region,
          },
          coverPictureKey: data,
          coverPictureModerationStatus: ModerationStatus.PENDING,
        }
      );

      return updateUser;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
    },
  });
};

export { useUpdateCover };
