import {
  Button,
  CardButton,
  Divider,
  Header,
  Icon,
  KeyboardAvoidingScroll,
  Text,
} from '@components';
import { useAuth } from '@contexts';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetUser } from '@hooks';
import { UserType,
  Routes
} from '@types';
import { Auth } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import {
  ButtonContainer,
  ContentContainer,
  HeaderConteiner,
  HorizontalPadding,
  InputContainer,
  Label,
  ScreenContainer,
  TextContainer,
} from './styles';
import { ControlledInput } from '../../../components/Input/ControlledInput';

type AccountSettingsForm = {
  email: string;
};
const AccountSettingsScreen = ({ navigation }: any) => {
  const { user, changeEmail, socialLogin } = useAuth();
  const { data } = useGetUser();
  const isGoogle =
    (user.identities &&
      JSON.parse(user.identities)[0].providerName === 'Google') ||
    false;

  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .required('Email can not be empty')
      .matches(
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
        'Please enter valid email'
      ),
  });

  const { control, getValues, register, handleSubmit, setError } =
    useForm<AccountSettingsForm>({
      defaultValues: {
        email: user.email,
      },
      resolver: yupResolver(validationSchema),
    });

  useEffect(() => {
    register('email');
  }, [register]);

  const handleSave = async ({ email }: AccountSettingsForm) => {
    // We should ONLY format the email when we need it to be formatted.
    // Changing the email while the user is entering it is expensive, bad UX, and worst of all, stupid.
    const formattedEmail = email.toLowerCase();

    if (user.email === formattedEmail) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate(Routes.Settings);
      }
    } else {
      try {
        setIsLoading(true);
        await Auth.signIn(formattedEmail, 'fail');
      } catch (caughtError) {
        switch (caughtError?.code) {
          case 'UserNotFoundException':
            await changeEmail(formattedEmail);
            setIsLoading(false);
            navigation.navigate(Routes.ChangeEmailVerification, {
              formattedEmail,
            });
            break;
          default:
            setIsLoading(false);
            setError('email', {
              type: 'manual',
              message: 'This email is already in use.',
            });
            break;
        }
      }
    }
  };

  const handleDeleteMyAccountclick = () => {
    navigation.navigate(Routes.DeleteAccountWarning);
  };

  const handleEditProfileClick = () => {
    const profileEdit =
      data?.userType === UserType.VENUE
        ? 'VenueProfileEdit'
        : 'PersonProfileEdit';
    navigation.navigate(profileEdit);
  };

  return (
    <ScreenContainer>
      <HeaderConteiner>
        <Header title="Account" />
      </HeaderConteiner>
      <KeyboardAvoidingScroll>
        <HorizontalPadding>
          <ContentContainer>
            {socialLogin ? (
              <InputContainer>
                <Label>Email</Label>
                <TextContainer>
                  <Icon
                    name={isGoogle ? 'google' : 'apple'}
                    size={20}
                    color="primary500"
                  />
                  <Text color="neutral600" size={16}>
                    {getValues('email')}
                  </Text>
                </TextContainer>
              </InputContainer>
            ) : (
              <ControlledInput
                control={control}
                name="email"
                label="E-mail"
                placeholder="e-mail@service.com"
                color="neutral600"
                maxLength={100}
              />
              // <InputContainer>
              //   <Input
              //     label="E-mail"
              //     placeholder="e-mail@service.com"
              //     value={getValues('email')}
              //     onChangeText={(text: string) => {
              //       setValue('email', text.toLowerCase());
              //       clearErrors('email');
              //       setUserAlreadyExists(false);
              //     }}
              //     error={userAlreadyExists || !!errors?.email}
              //     errorMessage={
              //       userAlreadyExists
              //         ? 'This email is already in use'
              //         : errors?.email?.message
              //     }
              //     maxLength={100}
              //   />
              // </InputContainer>
            )}
            <Divider mb={0} />
            <CardButton
              profilePicture={data?.profilePictureLoaded}
              title="Edit My Info"
              content="Change Name, Profile Picture and Bio."
              onPress={handleEditProfileClick}
              mv={0}
            />
            <Divider mb={6} />
            <Button
              mh={4}
              label="Delete my account"
              icon="trash"
              iconSize={20}
              center={false}
              iconColor="primary500"
              variant="textOnlyPrimary"
              ph={0}
              onPress={handleDeleteMyAccountclick}
            />
          </ContentContainer>
          <ButtonContainer>
            <Button
              label="Save"
              loading={isLoading}
              onPress={handleSubmit(handleSave)}
              full
            />
          </ButtonContainer>
        </HorizontalPadding>
      </KeyboardAvoidingScroll>
    </ScreenContainer>
  );
};
export { AccountSettingsScreen };
