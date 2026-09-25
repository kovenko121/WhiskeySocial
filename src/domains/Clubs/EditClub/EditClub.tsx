import {
  Button,
  Header,
  Icon,
  Input,
  KeyboardAvoidingScroll,
  PopUpMenu,
  ProfilePicture,
  Text,
} from '@components';
import { addPicture, getBlob, getDefaultClubImage, isUnauthorizedClubActionError } from '@helpers';
import { createImageKey } from '@whiskey-social/image-keys';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  useClub,
  useGetClubMembership,
  useUpdateClub,
  useValidateClubName,
} from '@hooks';
import type { UpdateClubInput } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClubRole, MemberStatus } from '@types';
import type { RootStackParams } from '@types';
import { Storage } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Switch, TouchableOpacity } from 'react-native';
import * as yup from 'yup';
import { createLogger } from '../../../services/logger';
import {
  ButtonContainer,
  ContentContainer,
  CoverPhotoContainer,
  CoverPhotoImage,
  CoverPhotoPlaceholder,
  EditIconOverlay,
  FormContainer,
  HeaderContainer,
  InputContainer,
  PictureContainer,
  PrivacyHelperText,
  PrivacyLabel,
  PrivacyRow,
  PrivacySection,
  ScreenContainer,
} from './styles';

type ClubForm = {
  clubName: string;
  clubDetails: string | null | undefined;
};

type Props = NativeStackScreenProps<RootStackParams, 'EditClub'>;

const logger = createLogger('EditClub');

// TODO: May need Lambda authorizer to check club admin permissions beyond client-side check
export const EditClubScreen = ({ navigation, route }: Props) => {
  const { clubId } = route.params;
  const { data: club, isLoading: clubLoading } = useClub(clubId);
  const { data: membership, isLoading: membershipLoading } = useGetClubMembership(clubId);

  const [profilePicture, setProfilePicture] = useState<any>(undefined);
  const [coverPhoto, setCoverPhoto] = useState<any>(undefined);
  const [isClosing, setIsClosing] = useState(false);
  const [showProfilePictureMenu, setProfilePictureMenuStatus] = useState(false);
  const [showCoverPhotoMenu, setCoverPhotoMenuStatus] = useState(false);

  const { mutate: updateClub, isPending: isUpdating } = useUpdateClub();
  const { validateClubName } = useValidateClubName();

  // Privacy toggle state - initialized from club data in useEffect below
  const [isPrivate, setIsPrivate] = useState<boolean>(false);

  // Check if user is admin/owner
  const isAdmin =
    membership?.status === MemberStatus.ACTIVE &&
    (membership?.role === ClubRole.CLUBADMINROLE || membership?.role === ClubRole.CLUBOWNERROLE);

  // Redirect non-admins back to club profile
  useEffect(() => {
    if (!clubLoading && !membershipLoading && !isAdmin) {
      navigation.goBack();
    }
  }, [clubLoading, membershipLoading, isAdmin, navigation]);

  const validationSchema = yup.object().shape({
    clubName: yup
      .string()
      .trim()
      .min(3, 'Club name must be at least 3 characters')
      .max(50, 'Club name must be at most 50 characters')
      .required('Club name is required'),
    clubDetails: yup
      .string()
      .trim()
      .max(500, 'Description must be at most 500 characters')
      .transform((value) => value || null)
      .nullable()
      .optional(),
  });

  const {
    clearErrors,
    reset,
    getValues,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ClubForm>({
    resolver: yupResolver(validationSchema) as any,
  });

  const withoutErrors = errors && Object.keys(errors).length === 0;

  const onSubmit = async (dataForm: ClubForm) => {
    if (!withoutErrors || !club) return;

    // Validate club name uniqueness if name changed
    if (dataForm.clubName !== club.clubName) {
      try {
        const validation = await validateClubName({
          clubName: dataForm.clubName,
          currentClubId: clubId,
        });

        if (!validation.isAvailable) {
          setError('clubName', {
            type: 'manual',
            message: 'This club name is already in use',
          });
          return;
        }
      } catch (error) {
        logger.error('Name validation error:', error as Error);
        Alert.alert('Error', 'Unable to validate club name. Please try again.');
        return;
      }
    }

    try {
      const updateData: UpdateClubInput = {
        id: clubId,
        clubName: dataForm.clubName,
        clubDetails: dataForm.clubDetails,
        isPrivate,
      };

      // Handle profile picture upload
      if (
        profilePicture != null &&
        typeof profilePicture === 'object' &&
        'uri' in profilePicture &&
        !profilePicture.uri?.includes('https')
      ) {
        const fileName = profilePicture.uri?.split('/').pop() as string;
        const blob = await getBlob(profilePicture.uri);
        const prefixedFileName = createImageKey('profile', fileName);

        updateData.profilePicture = prefixedFileName;
        // Upload to S3 after saving to DB
        Storage.put(prefixedFileName, blob, { level: 'public' });
      }

      // Handle cover photo upload
      if (
        coverPhoto != null &&
        typeof coverPhoto === 'object' &&
        'uri' in coverPhoto &&
        !coverPhoto.uri?.includes('https')
      ) {
        const fileName = coverPhoto.uri?.split('/').pop() as string;
        const blob = await getBlob(coverPhoto.uri);
        const prefixedFileName = createImageKey('cover', fileName);

        updateData.coverPhoto = prefixedFileName;
        // Upload to S3 after saving to DB
        Storage.put(prefixedFileName, blob, { level: 'public' });
      }

      updateClub(updateData, {
        onSuccess: () => {
          Alert.alert('Success', 'Club updated successfully', [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]);
        },
        onError: (error: Error) => {
          logger.error('Update club error:', error);
          const errorMessage = isUnauthorizedClubActionError(error)
            ? error.message
            : 'Unable to update club. Please try again.';
          Alert.alert('Error', errorMessage);
        },
      });
    } catch (error) {
      logger.error('Submit error:', error as Error);
      Alert.alert('Error', 'Unable to update club. Please try again.');
    }
  };

  useEffect(() => {
    if (club) {
      reset({
        clubName: club.clubName || '',
        clubDetails: club.clubDetails || '',
      });
      setProfilePicture(club.profilePicture || undefined);
      setCoverPhoto(club.coverPhoto || undefined);
      setIsPrivate(club.isPrivate ?? false);
    }
  }, [reset, club]);

  const onChange = (name: keyof ClubForm, field: string) => {
    setValue(name, field);
    clearErrors(name);
  };

  useEffect(() => {
    register('clubName');
    register('clubDetails');
  }, [register]);

  const profilePictureOptions = [
    {
      id: 'upload-profile-pic',
      title: 'Upload Picture',
      icon: 'upload',
      action: () => addPicture('upload', setProfilePictureMenuStatus, setProfilePicture),
    },
    {
      id: 'take-profile-pic',
      title: 'Take Photo',
      icon: 'take-picture',
      action: () => addPicture('take', setProfilePictureMenuStatus, setProfilePicture),
    },
  ];

  const coverPhotoOptions = [
    {
      id: 'upload-cover',
      title: 'Upload Photo',
      icon: 'upload',
      action: () => addPicture('upload', setCoverPhotoMenuStatus, setCoverPhoto),
    },
    {
      id: 'take-cover',
      title: 'Take Photo',
      icon: 'take-picture',
      action: () => addPicture('take', setCoverPhotoMenuStatus, setCoverPhoto),
    },
  ];

  /**
   * Handle privacy toggle - updates local state and shows info alert.
   * Actual save happens when user clicks Save button.
   */
  const handlePrivacyToggle = (newValue: boolean) => {
    setIsPrivate(newValue);
    Alert.alert(
      'Privacy Change',
      'All club posts will be updated when you save.',
    );
  };

  if (clubLoading) {
    return (
      <ScreenContainer>
        <HeaderContainer>
          <Header title="Edit Club" />
        </HeaderContainer>
        <ContentContainer>
          <ActivityIndicator size="large" color="#fff" />
        </ContentContainer>
      </ScreenContainer>
    );
  }

  if (!club) {
    return (
      <ScreenContainer>
        <HeaderContainer>
          <Header title="Edit Club" />
        </HeaderContainer>
        <ContentContainer>
          <Text>Club not found</Text>
        </ContentContainer>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <HeaderContainer>
        <Header title="Edit Club" />
      </HeaderContainer>
      <KeyboardAvoidingScroll>
        <ContentContainer>
          {/* Cover Photo */}
          <TouchableOpacity
            onPress={() => {
              if (showCoverPhotoMenu && !isClosing) setCoverPhotoMenuStatus(false);
              if (!showCoverPhotoMenu && !isClosing) setCoverPhotoMenuStatus(true);
            }}
          >
            <CoverPhotoContainer>
              {coverPhoto ? (
                <CoverPhotoImage
                  source={
                    typeof coverPhoto === 'string'
                      ? { uri: coverPhoto }
                      : coverPhoto
                  }
                  resizeMode="cover"
                />
              ) : (
                <CoverPhotoPlaceholder>
                  <Icon name="picture" size={48} color="grey300" />
                  <Text size={14} color="grey300" mt={8}>
                    Tap to add cover photo
                  </Text>
                </CoverPhotoPlaceholder>
              )}
              {coverPhoto && (
                <EditIconOverlay>
                  <Icon name="edit" size={20} color="white" />
                </EditIconOverlay>
              )}
            </CoverPhotoContainer>
          </TouchableOpacity>

          {showCoverPhotoMenu && (
            <PopUpMenu
              width={60}
              options={coverPhotoOptions}
              alignItems="bottom"
              paddingBottom={160}
              paddingLeft={95}
              setVisibleStatus={setCoverPhotoMenuStatus}
              setIsClosingStatus={setIsClosing}
              reverse
              showLoading={false}
            />
          )}

          {/* Profile Picture */}
          <PictureContainer>
            <ProfilePicture
              image={profilePicture ?? getDefaultClubImage()}
              size="large"
              editable
              border
              onPress={() => {
                if (showProfilePictureMenu && !isClosing)
                  setProfilePictureMenuStatus(false);
                if (!showProfilePictureMenu && !isClosing)
                  setProfilePictureMenuStatus(true);
              }}
            />
          </PictureContainer>

          {showProfilePictureMenu && (
            <PopUpMenu
              width={60}
              options={profilePictureOptions}
              alignItems="bottom"
              paddingBottom={160}
              paddingLeft={95}
              setVisibleStatus={setProfilePictureMenuStatus}
              setIsClosingStatus={setIsClosing}
              reverse
              showLoading={false}
            />
          )}

          <FormContainer>
            {/* Privacy Toggle Section */}
            <PrivacySection>
              <PrivacyRow>
                <PrivacyLabel>Private Club</PrivacyLabel>
                <Switch
                  value={isPrivate}
                  onValueChange={handlePrivacyToggle}
                  disabled={isUpdating}
                  accessibilityLabel="Private Club Toggle"
                  accessibilityHint="Toggles whether the club is private or public"
                />
              </PrivacyRow>
              <PrivacyHelperText>
                {isPrivate
                  ? 'Only members can view club info and posts.'
                  : 'Anyone can view club info and posts.'}
              </PrivacyHelperText>
            </PrivacySection>

            <InputContainer>
              <Input
                label="Club Name"
                labelSize={18}
                placeholder="Enter club name"
                color="neutral600"
                value={getValues('clubName')}
                onChangeText={(text) => onChange('clubName', text)}
                error={!!errors?.clubName}
                errorMessage={errors?.clubName?.message}
                maxLength={50}
              />
            </InputContainer>

            <InputContainer>
              <Input
                label="Description"
                labelSize={18}
                placeholder="Enter club description (optional)"
                color="neutral600"
                value={getValues('clubDetails') ?? ''}
                numberOfLines={4}
                onChangeText={(text) => onChange('clubDetails', text)}
                error={!!errors?.clubDetails}
                errorMessage={errors?.clubDetails?.message}
                maxLength={500}
                counter={`${
                  getValues('clubDetails')
                    ? 500 - (getValues('clubDetails')?.length ?? 0)
                    : 500
                }`}
              />
            </InputContainer>
          </FormContainer>
        </ContentContainer>
      </KeyboardAvoidingScroll>
      <ButtonContainer>
        <Button
          label="Save"
          loading={isUpdating}
          onPress={handleSubmit(onSubmit)}
          icon="floppy-disk"
        />
      </ButtonContainer>
    </ScreenContainer>
  );
};
