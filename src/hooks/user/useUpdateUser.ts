import { useAuth } from '@contexts';
import { capitalizeAll, normalizeApostrophes } from '@helpers';
import { useNavigation } from '@react-navigation/native';
import { amplify, queryClient } from '@services';
import { ModerationStatus, NavigationProps, User } from '@types';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import awsconfig from '../../config/aws';
import { createLogger } from '../../services/logger';
import { UpdateUser } from './mutation/updateUser';
import { useUserModerationPolling } from './useUserModerationPolling';

const logger = createLogger('useUpdateUser');

const useUpdateUser = (nextPage: string) => {
  const {
    user: { sub },
  } = useAuth();
  const navigation = useNavigation<NavigationProps>();
  const { trackImageUpload } = useUserModerationPolling();

  return useMutation<
    User,
    unknown,
    {
      username?: string | undefined;
      firstName?: string | undefined;
      lastName?: string | undefined;
      bio?: string | undefined;
      profilePictureKey?: string | undefined;
      venueName?: string | undefined;
      venueWebsite?: string | undefined;
      venueHours?: string | undefined;
      phone?: string | undefined;
      countryCode?: string | undefined;
      street?: string | undefined;
      city?: string | undefined;
      state?: string | undefined;
      number?: string | undefined;
      geoPoint?:
      | {
        lat: number;
        lon: number;
      }
      | undefined;
    }
  >({
    mutationFn: async (data) => {
      const { updateUser } = await amplify.request<{ updateUser: User }>(
        UpdateUser,
        {
          id: sub,
          ...(data.profilePictureKey && {
            profilePicture: {
              key: data.profilePictureKey,
              bucket: awsconfig.aws_user_files_s3_bucket,
              region: awsconfig.aws_user_files_s3_bucket_region,
            },
            profilePictureKey: data.profilePictureKey,
            profilePictureModerationStatus: ModerationStatus.PENDING,
          }),
          ...(data.username && { username: data.username.trim() }),
          fullName:
            data?.firstName &&
            data?.lastName &&
            `${normalizeApostrophes(data.firstName).trim()} ${normalizeApostrophes(
              data.lastName
            ).trim()}`
              .normalize('NFD')
              .replace(/\p{Diacritic}/gu, '')
              .replaceAll('&', 'ëéèê')
              .toLowerCase(),
          bio: data.bio?.trim().replace(/\n+/g, '\n'),
          firstName: data?.firstName && capitalizeAll(data?.firstName.trim()),
          lastName: data?.lastName && capitalizeAll(data?.lastName.trim()),
          venueName:
            data.venueName &&
            capitalizeAll(normalizeApostrophes(data.venueName).trim()),
          venueSearchName:
            data.venueName &&
            normalizeApostrophes(data.venueName)
              .trim()
              .normalize('NFD')
              .replace(/\p{Diacritic}/gu, '')
              .replaceAll('&', 'ëéèê')
              .toLowerCase(),
          venueWebsite: data.venueWebsite?.trim() || undefined,
          venueHours: data.venueHours?.trim() || undefined,
          countryCode: data.countryCode && data.countryCode?.trim(),
          ...(data.phone?.trim() && {
            phone: `${data.countryCode?.trim() ?? ''} ${data.phone.trim()}`,
          }),
          street: data.street && data.street?.trim(),
          city: data.city && data.city?.trim(),
          state: data.state && data.state?.trim(),
          number: data.number && data.number?.trim(),
          geoPoint: data.geoPoint,
        }
      );

      return updateUser;
    },
    onSuccess(_, variables) {
      queryClient.refetchQueries({ queryKey: ['get-user', sub] });
      // Start tracking if profile picture was uploaded
      if (variables.profilePictureKey) {
        trackImageUpload('profile');
      }
      navigation.navigate(nextPage as never);
    },
    onError(error: any) {
      logger.error('Error updating user:', error);
      Alert.alert(
        'Error',
        error?.message || 'Could not save your profile. Please try again.'
      );
    },
  });
};

export { useUpdateUser };
