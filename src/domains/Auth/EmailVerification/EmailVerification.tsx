import {
  Alert,
  Button,
  Icon,
  InputCode,
  KeyboardAvoidingContainer,
  Link,
  Text,
  Title,
} from '@components';
import { contactSupport } from '@helpers';
import { useAuth } from '@contexts';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams } from '@types';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Header } from '../components';
import {
  ButtonContainer,
  ContentContainer,
  ErrorContainer,
  IconWrapper,
  InputContainer,
  ScreenContainer,
  SubtitleContainer,
} from './styles';
import { useBottomPadding } from '../../../hooks/uxui/useBottomPadding';

type Props = NativeStackScreenProps<RootStackParams, 'EmailVerification'>;

const EmailVerificationScreen = ({ route, navigation }: Props) => {
  const { email, type } = route.params;
  const { verifyCode, emailSignin, sendCode } = useAuth();
  const [code, setCode] = useState(route.params.code || '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [counter, setCounter] = useState(0);

  const { bottomPadding, keyboardVisible } = useBottomPadding();

  useFocusEffect(
    useCallback(() => {
      setCode('');
      setErrorMessage('');
      setCounter(0);
    }, []),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      Alert(
        'Leave verification?',
        "Are you sure? You'll need to re-enter your email.",
        undefined,
        () => {
          unsubscribe();
          navigation.dispatch(e.data.action);
        },
      );
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!counter) return;

    const intervalId = setInterval(() => {
      setCounter(counter - 1);
    }, 1000);
    // eslint-disable-next-line consistent-return
    return () => clearInterval(intervalId);
  }, [counter]);

  const resendCode = async () => {
    setCounter(60);
    setErrorMessage('');
    await sendCode(email, type);
  };

  const handleConfirmCode = async () => {
    setLoading(true);
    setErrorMessage('');

    if (!code) {
      setLoading(false);
      setErrorMessage('Code are required');
    }

    if (!email) {
      setErrorMessage('Email are required');
    }

    try {
      await verifyCode(email, code, type);
      await emailSignin(email, email);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage('Unable to verify code');
    }
  };

  return (
    <ScreenContainer>
      {/* The keyboard avoiding view was moved INTO the screen container, this is so IF the keyboard does add extra padding the background will keep the consistent Theme color, rather than a white bar  */}
      {/* Ideally we'd follow the Docs for keyboardAvoidingView, which suggest that the view should be above ALL other views. But Expo and the React Native community actually suggest not using the Native component at all */}
      {/* TODO This is a ideal candidate for a refactor and new library to better handle the keyboard across both iOS and the problem child, Android. */}
      <KeyboardAvoidingContainer>
        <Header />
        <ContentContainer>
          <Title size={27} color="primary">
            Input the 6 digit{'\n'}Verification Code
          </Title>

          <InputContainer>
            <InputCode value={code} onChange={setCode} length={6} />
          </InputContainer>

          {!errorMessage ? (
            <SubtitleContainer>
              <IconWrapper>
                <Icon name="mail" color="primary500" size={22} />
              </IconWrapper>

              <Text align="center">
                We've sent a code to <Text bold>{email}</Text>
              </Text>
              <Text align="center">
                Check your spam folder if you don't see it.
              </Text>
            </SubtitleContainer>
          ) : (
            <ErrorContainer>
              <IconWrapper>
                <Icon name="sad" color="red" size={22} />
              </IconWrapper>

              <Text color="red" align="center">
                Verification failed
              </Text>
              <Text color="red" align="center">
                {errorMessage}
              </Text>
            </ErrorContainer>
          )}

          {counter > 0 ? (
            <Text align="center">
              You can resend the code in <Text bold>{counter} seconds.</Text>
            </Text>
          ) : (
            <Link color="primary" onPress={resendCode} bold>
              Resend Code
            </Link>
          )}

          <Link
            color="neutral300"
            mv={16}
            onPress={() => contactSupport('email_verification')}
          >
            Still no code? Contact support.
          </Link>
        </ContentContainer>
      </KeyboardAvoidingContainer>

      <ButtonContainer
        style={{ paddingBottom: keyboardVisible ? 20 : bottomPadding }}
      >
        <Button
          label="Continue"
          loading={loading}
          onPress={handleConfirmCode}
          full
          mv={12}
        />
      </ButtonContainer>
    </ScreenContainer>
  );
};

export { EmailVerificationScreen };
