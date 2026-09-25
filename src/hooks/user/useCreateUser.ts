import { useAuth } from '@contexts';
import { capitalizeAll } from '@helpers';
import { amplify, queryClient } from '@services';
import { User } from '@types';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import awsconfig from '../../config/aws';
import { CreateUser } from './mutation/createUser';
import { createLogger } from '../../services/logger';

const logger = createLogger('useCreateUser');

const useCreateUser = () => {
  const [finishOnboardingError, setFinishOnboardingError] = useState<Error | null>(null);

  const {
    handleFinishOnboarding,
    user: { sub },
  } = useAuth();

  const mutation = useMutation<
    User,
    unknown,
    {
      username?: string | undefined;
      firstName?: string | undefined;
      lastName?: string | undefined;
      userType: string;
      venueName?: string | undefined;
      phone?: string | undefined;
      countryCode?: string | undefined;
      street?: string | undefined;
      city?: string | undefined;
      state?: string | undefined;
      number?: string | undefined;
      venueMenuKey?: string | undefined;
      geoPoint?:
      | {
        lat: number;
        lon: number;
      }
      | undefined;
    }
  >({
    mutationFn: async (data) => {
      const { createUser } = await amplify.request<{ createUser: User }>(
        CreateUser,
        {
          id: sub,
          username: data.username?.trim().toLowerCase() || '',
          firstName: data?.firstName && capitalizeAll(data?.firstName.trim()),
          lastName: data?.lastName && capitalizeAll(data?.lastName.trim()),
          venueName: data.venueName && capitalizeAll(data.venueName.trim()),
          phone: `${data.countryCode} ${data.phone?.trim()}`,
          street: data.street && data.street?.trim(),
          city: data.city && data.city?.trim(),
          state: data.state && data.state?.trim(),
          number: data.number && data.number?.trim(),
          geoPoint: data.geoPoint,
          userType: data.userType,
          venueMenu: data.venueMenuKey && {
            key: data.venueMenuKey,
            bucket: awsconfig.aws_user_files_s3_bucket,
            region: awsconfig.aws_user_files_s3_bucket_region,
          },
        }
      );

      return createUser;
    },
    async onSuccess() {
      setFinishOnboardingError(null)
      try {
        await handleFinishOnboarding();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to complete account setup');
        logger.error('Failed to finish onboarding after user creation:', error);
        setFinishOnboardingError(error);
      } finally {
        queryClient.refetchQueries({ queryKey: ['get-user', sub] });
      }
    },
  });


  return { ...mutation, finishOnboardingError }
};

export { useCreateUser };
