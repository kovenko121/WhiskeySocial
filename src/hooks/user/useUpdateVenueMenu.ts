import { useAuth } from '@contexts';
import { amplify, queryClient } from '@services';
import { User } from '@types';
import { useMutation } from '@tanstack/react-query';
import awsconfig from '../../config/aws';
import { UpdateUserVenueMenu } from './mutation/updateUserVenueMenu';

const useUpdateVenueMenu = () => {
  const {
    user: { sub },
  } = useAuth();

  return useMutation<User, unknown, string>({
    mutationFn: async (data) => {
      const { updateUser } = await amplify.request<{ updateUser: User }>(
        UpdateUserVenueMenu,
        {
          id: sub,
          venueMenu: {
            key: data,
            bucket: awsconfig.aws_user_files_s3_bucket,
            region: awsconfig.aws_user_files_s3_bucket_region,
          },
        }
      );

      return updateUser;
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
    },
  });
};

export { useUpdateVenueMenu };
