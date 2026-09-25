import {
  Button,
  Header,
  Input,
  KeyboardAvoidingScroll,
  PopUpMenu,
  ProfilePicture,
} from '@components';
import { addPicture, getBlob, getGeoPoint, uploadFile } from '@helpers';
import { createImageKey } from '@whiskey-social/image-keys';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetUser, useUpdateUser, useUpdateVenueMenu } from '@hooks';
import { Storage } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import {
  ButtonContainer,
  ContentContainer,
  FormContainer,
  HeaderConteiner,
  PictureContainer,
  ScreenContainer,
} from './styles';

type ProfileForm = {
  venueName: string;
  bio: string | undefined;
  hours: string | undefined;
  website: string | undefined;
  phone: string;
  countryCode: string | undefined;
  street: string;
  city: string;
  state: string;
  number: string;
};

const validationSchema = yup.object().shape({
  venueName: yup.string().trim().required('Establishment name is required'),
  phone: yup.string().trim().required('Phone is required'),
  countryCode: yup.string().trim(),
  street: yup.string().trim().required('Street is required'),
  city: yup.string().trim().required('City is required'),
  state: yup.string().trim().required('State is required'),
  number: yup.string().trim().required('Zip Code is required'),
  bio: yup.string().trim(),
  hours: yup.string().trim(),
  website: yup
    .string()
    .trim()
    .url('Please enter a valid URL (e.g. https://example.com)'),
});

const VenueProfileEditScreen = () => {
  const { data } = useGetUser();
  const [profilePicture, setProfilePicture] = useState(
    data?.profilePictureLoaded || undefined
  );
  const { mutate, isPending } = useUpdateUser('MyCollection');
  const [isClosing, setIsClosing] = useState(false);
  const { mutate: mutateVenueMenu, isPending: isLoadingUpdateMenu } =
    useUpdateVenueMenu();

  const [showPictureMenu, setPictureMenuStatus] = useState(false);

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
      const geoPoint = await getGeoPoint(
        `${dataForm.street},${dataForm.number},${dataForm.city},${dataForm.state}`
      );
      const venueWebsite = dataForm.website?.trim() || undefined;
      const venueHours = dataForm.hours?.trim() || undefined;
      if (profilePicture != null && typeof profilePicture === 'object' && 'uri' in profilePicture && !profilePicture.uri?.includes('https')) {
        const fileName = profilePicture.uri?.split('/').pop() as string;
        const blob = await getBlob(profilePicture.uri);

        const prefixedFileName = createImageKey('profile', fileName);

        // Save the key to DB first so it's there when Lambda runs
        mutate({ ...dataForm, venueWebsite, venueHours, geoPoint, profilePictureKey: prefixedFileName });

        // Then upload to S3 (which triggers the Lambda)
        Storage.put(prefixedFileName, blob, { level: 'public' });
      } else {
        mutate({ ...dataForm, venueWebsite, venueHours, geoPoint });
      }
    }
  };

  useEffect(() => {
    reset({
      venueName: data?.venueName || '',
      bio: data?.bio || '',
      hours: data?.venueHours || '',
      website: data?.venueWebsite || '',
      phone: data?.venuePhone?.split(' ')[1] || '',
      countryCode: data?.venuePhone?.split(' ')[0] || '',
      street: data?.venueAddressStreet || '',
      city: data?.venueAddressCity || '',
      state: data?.venueAddressState || '',
      number: data?.venueAddressNumber || '',
    });
  }, [reset, data]);

  const uploadMenuCallback = async () => {
    const uploadedMenu = await uploadFile();
    if (uploadedMenu) {
      const blob = await getBlob(uploadedMenu.uri);

      const venueMenuKey = createImageKey('menu', `${data?.venueName}.pdf`);

      Storage.put(venueMenuKey, blob, {
        contentType: 'application/pdf',
      });
      mutateVenueMenu(venueMenuKey);
    }
  };

  const removeVenueMenu = async () => {
    mutateVenueMenu('');
  };

  const onChange = (name: any, field: any) => {
    setValue(name, field);
    clearErrors(name);
  };

  useEffect(() => {
    register('venueName');
    register('bio');
    register('hours');
    register('website');
    register('phone');
    register('countryCode');
    register('street');
    register('city');
    register('state');
    register('number');
  }, [register]);

  // Sync local profilePicture state when cache data changes (for moderation updates)
  useEffect(() => {
    setProfilePicture(data?.profilePictureLoaded || undefined);
  }, [data?.profilePictureLoaded]);

  const options = [
    {
      title: 'Upload Picture',
      icon: 'upload',
      action: () =>
        addPicture('upload', setPictureMenuStatus, setProfilePicture),
    },
    {
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
              width={55}
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
            <Input
              label="Establishment Name"
              labelSize={18}
              color="neutral600"
              value={getValues('venueName')}
              onChangeText={(text: string) => onChange('venueName', text)}
              error={!!errors?.venueName}
              errorMessage={errors?.venueName?.message}
              maxLength={40}
            />

            <Input
              editable={false}
              label="Username"
              labelSize={18}
              color="neutral600"
              value={data?.username || ''}
              maxLength={20}
            />

            <Input
              label="Phone Number"
              labelSize={18}
              color="neutral600"
              keyboardType="phone-pad"
              value={getValues('phone')}
              onChangeText={(text) => onChange('phone', text)}
              error={!!errors?.phone}
              errorMessage={errors?.phone?.message}
              large
              maxLength={15}
              countrySelect
              countryValue={data?.venuePhone?.split(' ')[0]}
              onCountryChange={(text: string) => onChange('countryCode', text)}
            />

            <Input
              label="Street"
              labelSize={18}
              color="neutral600"
              error={!!errors?.street}
              errorMessage={errors?.street?.message}
              value={getValues('street')}
              onChangeText={(text) => onChange('street', text)}
              maxLength={20}
            />

            <Input
              label="City"
              labelSize={18}
              color="neutral600"
              error={!!errors?.city}
              errorMessage={errors?.city?.message}
              value={getValues('city')}
              onChangeText={(text) => onChange('city', text)}
              maxLength={20}
            />

            <Input
              label="State"
              labelSize={18}
              color="neutral600"
              error={!!errors?.state}
              errorMessage={errors?.state?.message}
              value={getValues('state')}
              onChangeText={(text) => onChange('state', text)}
              maxLength={20}
            />

            <Input
              label="Zip Code"
              labelSize={18}
              color="neutral600"
              error={!!errors?.number}
              errorMessage={errors?.number?.message}
              value={getValues('number')}
              onChangeText={(text) => onChange('number', text)}
              keyboardType="number-pad"
              maxLength={20}
            />

            <Input
              label="Bio"
              labelSize={18}
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

            <Input
              label="Business Hours (optional)"
              labelSize={18}
              color="neutral600"
              value={getValues('hours')}
              numberOfLines={3}
              onChangeText={(text) => onChange('hours', text)}
              error={!!errors?.hours}
              errorMessage={errors?.hours?.message}
              maxLength={300}
              counter={`${
                getValues('hours') ? 300 - getValues('hours')!.length : 300
              }`}
            />

            <Input
              label="Website (optional)"
              labelSize={18}
              color="neutral600"
              value={getValues('website')}
              onChangeText={(text) => onChange('website', text)}
              error={!!errors?.website}
              errorMessage={errors?.website?.message}
              keyboardType="url"
              autoCapitalize="none"
              maxLength={200}
            />
          </FormContainer>
        </ContentContainer>
      </KeyboardAvoidingScroll>
      <ButtonContainer>
        {data?.venueMenu && data?.venueMenu.key ? (
          <Button
            label="Remove Full Menu PDF"
            variant="outlineRed"
            loading={isLoadingUpdateMenu}
            onPress={removeVenueMenu}
            mh={24}
            icon="close"
            iconColor="red"
            mv={8}
          />
        ) : (
          <Button
            label="Upload Full Menu PDF (optional)"
            variant="outlineDefault"
            loading={isLoadingUpdateMenu}
            onPress={uploadMenuCallback}
            mh={24}
            icon="download"
            mv={8}
          />
        )}

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
export { VenueProfileEditScreen };
