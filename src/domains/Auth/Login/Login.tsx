import {
  Button,
  KeyboardAvoidingScroll,
  Link,
  PrivacyPolicy,
  TermsAndConditions,
  Text,
} from '@components';
import { useAuth } from '@contexts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { isIos } from '@helpers';
import { useFeatureFlags } from '@hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CodeOperations, type RootStackParams,
  Routes
} from '@types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import OutsidePressHandler from 'react-native-outside-press';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as yup from 'yup';
import { Header } from '../components';
import {
  EmailLinkContainer,
  FormContainer,
  GuestContainer,
  LinkContainer,
  OrSection,
  SafeArea,
  ScreenContainer,
  Title,
  VersionText,
  modalBackgroundStyle,
} from './styles';
import { ControlledInput } from '../../../components/Input/ControlledInput';
import {
  authMessages,
  isSignInProvider,
  parsePreSignUpRejection,
  SignInProvider,
} from '../authMessages';
import { useVersion } from '../../../hooks/useVersion';


type Props = NativeStackScreenProps<RootStackParams, 'Login'>;

type EmailForm = {
  email: string;
};

const LoginScreen = ({ navigation }: Props) => {
  const {
    googleLogin,
    appleLogin,
    sendCode,
    emailSignup,
    emailSignin,
    signInMethodsForEmail,
    isLoading,
    continueAsGuest,
  } = useAuth();
  const { data: featureFlags } = useFeatureFlags();
  const [existingProvider, setExistingProvider] = useState<{
    provider: SignInProvider;
    blocked: boolean;
  } | null>(null);
  const [lookupThrottled, setLookupThrottled] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const privacyModalRef = useRef<BottomSheetModal>(null);
  const termsModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['85%', '85%'], []);
  const { top } = useSafeAreaInsets();
  const { version } = useVersion();

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .required('Email is required')
      .matches(
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
        'E-mail not valid'
      ),
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailForm>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    register('email');
  }, [register]);

  useEffect(() => {
    if (isLoading) {
      navigation.navigate(Routes.AuthLoading, {});
    }
  }, [isLoading, navigation]);

  const withoutErrors = errors && Object.keys(errors).length === 0;

  // eslint-disable-next-line consistent-return
  const attemptSignup = async (formattedEmail: string) => {
    try {
      await emailSignup(formattedEmail);
    } catch (err: unknown) {
      const rejection = parsePreSignUpRejection(err);

      if (!rejection) {
        throw err;
      }

      return setExistingProvider({
        provider: rejection.provider,
        blocked: true,
      });
    }

    return navigation.navigate(Routes.EmailVerification, {
      email: formattedEmail,
      type: CodeOperations.SIGN_UP,
    });
  };

  // eslint-disable-next-line consistent-return
  const probeForExistingAccount = async (formattedEmail: string) => {
    try {
      await emailSignin(formattedEmail, 'fail');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err) {
        if (err?.code === 'UserNotFoundException') {
          return attemptSignup(formattedEmail);
        }
        if (err?.code === 'NotAuthorizedException') {
          sendCode(formattedEmail, CodeOperations.SIGN_IN);
          return navigation.navigate(Routes.EmailVerification, {
            email: formattedEmail,
            type: CodeOperations.SIGN_IN,
          });
        }
        if (err?.code === 'UserNotConfirmedException') {
          sendCode(formattedEmail, CodeOperations.SIGN_UP);
          return navigation.navigate(Routes.EmailVerification, {
            email: formattedEmail,
            type: CodeOperations.SIGN_UP,
          });
        }
      }
    }
  };

  // eslint-disable-next-line consistent-return
  const onSubmit = async ({ email }: EmailForm) => {
    const formattedEmail = email.toLowerCase();

    if (!withoutErrors) {
      return;
    }

    setExistingProvider(null);
    setLookupThrottled(false);

    if (!featureFlags?.signInMethodDisclosure) {
      return probeForExistingAccount(formattedEmail);
    }

    const lookup = await signInMethodsForEmail(formattedEmail);

    if (lookup === 'RATE_LIMITED') {
      return setLookupThrottled(true);
    }

    if (!lookup) {
      return probeForExistingAccount(formattedEmail);
    }

    if (lookup.hasNativeAccount) {
      const operation =
        lookup.nativeStatus === 'UNCONFIRMED'
          ? CodeOperations.SIGN_UP
          : CodeOperations.SIGN_IN;

      sendCode(formattedEmail, operation);

      return navigation.navigate(Routes.EmailVerification, {
        email: formattedEmail,
        type: operation,
      });
    }

    const provider = lookup.methods.find(isSignInProvider);

    if (provider) {
      return setExistingProvider({ provider, blocked: false });
    }

    return attemptSignup(formattedEmail);
  };

  const handleGoogleLogin = async () => {
    setAppleLoading(false);
    setGoogleLoading(true);

    await googleLogin();

    setGoogleLoading(false);
  };

  const handleAppleLogin = async () => {
    setGoogleLoading(false);
    setAppleLoading(true);

    await appleLogin();

    setAppleLoading(false);
  };

  return (
    <KeyboardAvoidingScroll fullHeight>
      <SafeArea paddingTop={top}>
        <ScreenContainer>
          <FormContainer>
            <Header mt={40} noBack />

            <Title mv={36}>Login or Signup</Title>

            <Button
              variant="outlineDefault"
              loading={googleLoading}
              label="Continue with Google"
              icon="google"
              iconSize={22}
              onPress={handleGoogleLogin}
              mv={8}
              full
            />

            {isIos && (
              <Button
                variant="outlineDefault"
                loading={appleLoading}
                label="Continue with Apple"
                icon="apple"
                iconSize={24}
                mv={8}
                onPress={handleAppleLogin}
                full
              />
            )}

            <OrSection>
              <Text align="center" bold size={14}>
                or
              </Text>
            </OrSection>

            {showEmailForm ? (
              <>
                <ControlledInput
                  control={control}
                  name="email"
                  mv={8}
                  icon="mail"
                  iconColor="primary"
                  placeholder="Enter your E-mail"
                  keyboardType="email-address"
                  iconSize={23}
                  maxLength={100}
                  autoCapitalize="none"
                  startedWithFocus
                />

                {lookupThrottled && (
                  <Text size={14} color="neutral600" mv={8}>
                    {authMessages.tooManyAttempts}
                  </Text>
                )}

                {!!existingProvider && (
                  <>
                    {existingProvider.blocked && (
                      <Text size={16} color="primary" mt={8} bold>
                        {authMessages.blockedSignupTitle}
                      </Text>
                    )}

                    <Text size={14} color="neutral600" mv={8}>
                      {existingProvider.blocked
                        ? authMessages.blockedSignupBody(
                            existingProvider.provider
                          )
                        : authMessages.existingProviderInline(
                            existingProvider.provider
                          )}
                    </Text>

                    <Button
                      label={authMessages.continueWithProvider(
                        existingProvider.provider
                      )}
                      onPress={
                        existingProvider.provider === 'GOOGLE'
                          ? handleGoogleLogin
                          : handleAppleLogin
                      }
                      full
                      mv={8}
                    />
                  </>
                )}

                <Button
                  label="Sign-in"
                  loading={isSubmitting}
                  onPress={handleSubmit(onSubmit)}
                  full
                  mv={8}
                  disabled={!withoutErrors}
                />
              </>
            ) : (
              <EmailLinkContainer>
                <Link
                  onPress={() => setShowEmailForm(true)}
                  color="primary500"
                  size={14}
                  underlined
                >
                  Continue with email
                </Link>
              </EmailLinkContainer>
            )}

            <LinkContainer>
              <Text bold>
                <Link
                  onPress={() => termsModalRef.current?.present()}
                  color="primary"
                  bold
                >
                  {' '}
                  Terms & Conditions
                </Link>{' '}
                and
                <Link
                  onPress={() => privacyModalRef.current?.present()}
                  color="primary"
                  bold
                >
                  {' '}
                  Privacy Policy
                </Link>
                .
              </Text>
            </LinkContainer>
            <OutsidePressHandler
              onOutsidePress={() => termsModalRef.current?.close()}
            >
              <BottomSheetModal
                ref={termsModalRef}
                index={1}
                snapPoints={snapPoints}
                backgroundStyle={modalBackgroundStyle}
              >
                <TermsAndConditions />
              </BottomSheetModal>
            </OutsidePressHandler>
            <OutsidePressHandler
              onOutsidePress={() => privacyModalRef.current?.close()}
            >
              <BottomSheetModal
                ref={privacyModalRef}
                index={1}
                snapPoints={snapPoints}
                backgroundStyle={modalBackgroundStyle}
              >
                <PrivacyPolicy />
              </BottomSheetModal>
            </OutsidePressHandler>
          </FormContainer>
        </ScreenContainer>

        <GuestContainer>
          {!!featureFlags?.guestBrowsing && (
            <Link
              onPress={() => {
                continueAsGuest();
                navigation.navigate(Routes.Discover);
              }}
              color="neutral300"
            >
              Browse as guest
            </Link>
          )}

          <VersionText>v{version}</VersionText>
        </GuestContainer>
      </SafeArea>
    </KeyboardAvoidingScroll>
  );
};

export { LoginScreen };
