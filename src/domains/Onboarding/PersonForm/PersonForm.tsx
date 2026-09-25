import { Keyboard } from 'react-native';
import {
  Button,
  CardButton,
  Checkbox,
  Input,
  KeyboardAvoidingContainer,
  Link,
  PrivacyPolicy,
  SubTitle,
  TermsAndConditions,
  Text,
} from '@components';
import { useAuth } from '@contexts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateUser } from '@hooks';
import { UserType } from '@types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import OutsidePressHandler from 'react-native-outside-press';
import * as yup from 'yup';
import { Header } from '../../Auth/components';
import {
  AgreementsContainer,
  BottomButtonWrapper,
  ContentContainer,
  Empty,
  PositionContainer,
  ScreenContainer,
} from './styles';
import { colors } from '../../../styles/colors';

type OnboardingPersonForm = {
  firstName: string;
  lastName: string;
};

const PersonFormScreen = () => {
  const { user } = useAuth();
  const { mutate, error, isPending, finishOnboardingError } = useCreateUser();
  const [agreements, setAgreements] = useState(false);
  const [agreementsError, setAgreementsError] = useState('');
  const privacyModalRef = useRef<BottomSheetModal>(null);
  const termsModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['85%', '85%'], []);
  const { deleteUserOnboarding } = useAuth();

  const onPressResetOnboarding = async () => {
    await deleteUserOnboarding();
  };

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
  });

  const {
    reset,
    handleSubmit,
    clearErrors,
    getValues,
    register,
    setValue,
    formState: { errors },
  } = useForm<OnboardingPersonForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  const withoutErrors = errors && Object.keys(errors).length === 0;

  const onSubmit = async (dataForm: OnboardingPersonForm) => {
    Keyboard.dismiss();

    if (!agreements) {
      setAgreementsError('You need to accept the Terms & Conditions');
      return;
    }

    if (withoutErrors) {
      mutate({ userType: UserType.PERSON, ...dataForm });
    }
  };

  const onChange = (name: any, field: any) => {
    setValue(name, field);
    clearErrors(name);
  };

  useEffect(() => {
    reset({
      firstName: user?.name || '',
      lastName: user?.family_name || '',
    });
  }, [reset, user.family_name, user.name]);

  useEffect(() => {
    register('firstName');
    register('lastName');
  }, [register]);

  return (
    <ScreenContainer>
      <KeyboardAvoidingContainer>
        <>
          <ContentContainer>
            <PositionContainer>
              <Header
                navBack={onPressResetOnboarding}
              // wp={65}
              />
            </PositionContainer>

            <SubTitle color="primary500" center size={27} mt={32}>
              Profile Info
            </SubTitle>

            <Text align="center" mv={16}>
              We need some information to help users find you{'\n'}on Whiskey
              Social®
            </Text>

            <CardButton
              icon="user"
              title="Home"
              content="You're an individual user and you want to share your whiskey collection with friends and find other collections nearby."
              mv={8}
              active
            />

            <Empty />

            <Input
              placeholder="First Name"
              value={getValues('firstName')}
              onChangeText={(text: string) => onChange('firstName', text)}
              error={!!errors?.firstName}
              errorMessage={errors?.firstName?.message}
              mv={6}
              maxLength={20}
            />

            <Input
              placeholder="Last Name"
              error={!!errors?.lastName}
              errorMessage={errors?.lastName?.message}
              value={getValues('lastName')}
              onChangeText={(text) => onChange('lastName', text)}
              mv={6}
              maxLength={20}
            />

            <AgreementsContainer>
              <Checkbox value={agreements} onValueChange={setAgreements} />
              <Text align="center" mv={16}>
                I agree to the
                <Link
                  onPress={() => termsModalRef.current?.present()}
                  color="primary500"
                  size={11}
                  bold
                >
                  {' '}
                  Terms & Conditions
                </Link>{' '}
                and
                <Link
                  onPress={() => privacyModalRef.current?.present()}
                  color="primary500"
                  size={11}
                  bold
                >
                  {' '}
                  Privacy Policy
                </Link>
                .
              </Text>
            </AgreementsContainer>
            {agreementsError && (
              <AgreementsContainer>
                <Text color="red" align="center" mb={16}>
                  {agreementsError}
                </Text>
              </AgreementsContainer>
            )}
            {!!error && (
              <AgreementsContainer>
                <Text color="red" align="center" mb={16}>
                  Something went wrong. Please try again.
                </Text>
              </AgreementsContainer>
            )}
            {finishOnboardingError && (
              <AgreementsContainer>
                <Text color="red" align="center" mb={16}>
                  Account setup failed. Please check your connection and try again.
                </Text>
              </AgreementsContainer>
            )}
          </ContentContainer>
          <BottomButtonWrapper>
            <Button
              label="Continue"
              iconSpacing={false}
              disabled={!withoutErrors || !agreements}
              onPress={handleSubmit(onSubmit)}
              full
              loading={isPending}
            />
          </BottomButtonWrapper>

          <OutsidePressHandler
            onOutsidePress={() => termsModalRef.current?.close()}
          >
            <BottomSheetModal
              ref={termsModalRef}
              index={1}
              snapPoints={snapPoints}
              style={{ backgroundColor: colors.grey400 }}
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
              style={{ backgroundColor: colors.grey400 }}
            >
              <PrivacyPolicy />
            </BottomSheetModal>
          </OutsidePressHandler>
        </>
      </KeyboardAvoidingContainer>
    </ScreenContainer>
  );
};

export { PersonFormScreen };
