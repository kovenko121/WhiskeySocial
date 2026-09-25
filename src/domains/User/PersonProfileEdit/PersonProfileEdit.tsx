import {
  Button,
  Header,
  Input,
  KeyboardAvoidingScroll,
  PopUpMenu,
  ProfilePicture,
} from '@components';
import { addPicture, getBlob } from '@helpers';
import { createImageKey } from '@whiskey-social/image-keys';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetUser, useUpdateUser } from '@hooks';
import { Storage } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import {
  ButtonContainer,
  ContentContainer,
  FormContainer,
  HalfInputContainer,
  HeaderConteiner,
  InputContainer,
  PictureContainer,
  ScreenContainer,
} from './styles';

type ProfileForm = {
  firstName: string;
  lastName: string;
  bio: string | undefined;
};

const PersonProfileEditScreen = () => {
  const { data } = useGetUser();

  const [profilePicture, setProfilePicture] = useState(
    data?.profilePictureLoaded || undefined
  );
  const [isClosing, setIsClosing] = useState(false);

  const { mutate, isPending } = useUpdateUser('MyCollection');

  const [showPictureMenu, setPictureMenuStatus] = useState(false);

  const validationSchema = yup.object().shape({
    firstName: yup
      .string()
      .trim()
      .matches(/^[^0-9]*$/, "First name can't contain numbers")
      .required('First name is required'),
    lastName: yup
      .string()
      .trim()
      .matches(/^[^0-9]*$/, "Last name can't contain numbers")
      .required('Last name is required'),
    bio: yup.string().trim(),
  });

  const {
    clearErrors,
    reset,
    getValues,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: yupResolver(validationSchema),
  });

  const withoutErrors = errors && Object.keys(errors).length === 0;

  const onSubmit = async (dataForm: ProfileForm) => {
    if (withoutErrors) {
      if (profilePicture != null && typeof profilePicture === 'object' && 'uri' in profilePicture && !profilePicture.uri?.includes('https')) {
        const fileName = profilePicture.uri?.split('/').pop() as string;
        const blob = await getBlob(profilePicture.uri);

        const prefixedFileName = createImageKey('profile', fileName);
        
        // Save the key to DB first so it's there when Lambda runs
        mutate({ ...dataForm, profilePictureKey: prefixedFileName });

        // Then upload to S3 (which triggers the Lambda)
        Storage.put(prefixedFileName, blob, { level: 'public' });
      } else {
        mutate(dataForm);
      }
    }
  };

  useEffect(() => {
    reset({
      firstName: data?.personFirstName || '',
      lastName: data?.personLastName || '',
      bio: data?.bio || '',
    });
  }, [reset, data]);

  const onChange = (name: any, field: any) => {
    setValue(name, field);
    clearErrors(name);
  };

  useEffect(() => {
    register('firstName');
    register('lastName');
    register('bio');
  }, [register]);

  // Sync local profilePicture state when cache data changes (for moderation updates)
  useEffect(() => {
    setProfilePicture(data?.profilePictureLoaded || undefined);
  }, [data?.profilePictureLoaded]);

  const options = [
    {
      id: 'upload-pic',
      title: 'Upload Picture',
      icon: 'upload',
      action: () =>
        addPicture('upload', setPictureMenuStatus, setProfilePicture),
    },
    {
      id: 'take-pic',
      title: 'Take Photo',
      icon: 'take-picture',
      action: () => addPicture('take', setPictureMenuStatus, setProfilePicture),
    },
  ];

  return (
    <ScreenContainer>
      <HeaderConteiner>
        <Header title="Edit Profile" />
      </HeaderConteiner>
      <KeyboardAvoidingScroll>
        <ContentContainer>
          <PictureContainer>
            <ProfilePicture
              image={profilePicture}
              size="large"
              editable
              border
              onPress={() => {
                if (showPictureMenu && !isClosing) setPictureMenuStatus(false);
                if (!showPictureMenu && !isClosing) setPictureMenuStatus(true);
              }}
            />
          </PictureContainer>
          {showPictureMenu && (
            <PopUpMenu
              width={60}
              options={options}
              alignItems="bottom"
              paddingBottom={160}
              paddingLeft={95}
              setVisibleStatus={setPictureMenuStatus}
              setIsClosingStatus={setIsClosing}
              reverse
              showLoading={false}
            />
          )}

          <FormContainer>
            <HalfInputContainer>
              <InputContainer half>
                <Input
                  label="First Name"
                  labelSize={18}
                  placeholder=""
                  color="neutral600"
                  value={getValues('firstName')}
                  onChangeText={(text) => onChange('firstName', text)}
                  error={!!errors?.firstName}
                  errorMessage={errors?.firstName?.message}
                  maxLength={20}
                />
              </InputContainer>

              <InputContainer half>
                <Input
                  label="Last Name"
                  labelSize={18}
                  placeholder=""
                  color="neutral600"
                  value={getValues('lastName')}
                  onChangeText={(text) => onChange('lastName', text)}
                  error={!!errors?.lastName}
                  errorMessage={errors?.lastName?.message}
                  maxLength={20}
                />
              </InputContainer>
            </HalfInputContainer>

            <Input
              editable={false}
              label="Username"
              labelSize={18}
              placeholder=""
              color="neutral600"
              value={data?.username || ''}
              maxLength={20}
            />

            <Input
              label="Bio"
              labelSize={18}
              placeholder=""
              color="neutral600"
              value={getValues('bio')}
              numberOfLines={2}
              onChangeText={(text) => onChange('bio', text)}
              error={!!errors?.bio}
              errorMessage={errors?.bio?.message}
              maxLength={200}
              counter={`${
                getValues('bio') ? 200 - getValues('bio')!.length : 200
              }`}
            />
          </FormContainer>
        </ContentContainer>
      </KeyboardAvoidingScroll>
      <ButtonContainer>
        <Button
          label="Save"
          loading={isPending}
          onPress={handleSubmit(onSubmit)}
          mh={24}
          icon="floppy-disk"
        />
      </ButtonContainer>
    </ScreenContainer>
  );
};
export { PersonProfileEditScreen };
