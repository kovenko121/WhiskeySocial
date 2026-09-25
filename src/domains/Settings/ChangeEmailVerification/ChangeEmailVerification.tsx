import {
  Button,
  Header,
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
import { CodeOperations, type RootStackParams,
  Routes
} from '@types';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParams, 'ChangeEmailVerification'>;

const ChangeEmailVerification = ({ navigation, route }: Props) => {
  const { email } = route.params;
  const { changeEmail, verifyCode } = useAuth();
  const [code, setCode] = useState('');
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
    if (!counter) return;

    const intervalId = setInterval(() => {
      setCounter(counter - 1);
    }, 1000);

    // eslint-disable-next-line consistent-return
    return () => clearInterval(intervalId);
  }, [counter]);

  const sendCode = async () => {
    await changeEmail(email);
    setCounter(60);
  };

  const handleConfirmCode = async () => {
    if (code.length !== 6) {
      setErrorMessage('Code is invalid');
      return;
    }

    setLoading(true);
    const isValid = await verifyCode(email, code, CodeOperations.EMAIL_CHANGE);

    if (!isValid) {
      setErrorMessage('Code is invalid');
      setLoading(false);
      return;
    }

    setLoading(false);
    navigation.navigate(Routes.ChangeEmailConfirmation);
  };

  return (
  <ScreenContainer>
    {/* Keeps consistent background color behind keyboard */}
    <KeyboardAvoidingContainer>
      <Header title="Account" action={handleConfirmCode} />

      <ContentContainer>
        <Title size={27} color="primary">
          Input the 6-digit{'\n'}Verification Code
        </Title>

        <InputContainer>
          <InputCode value={code} onChange={setCode} length={6} />
        </InputContainer>

        {errorMessage ? (
          <ErrorContainer>
            <IconWrapper>
              <Icon name="sad" color="red" size={22} />
            </IconWrapper>
            <Text color="red" align="center">Verification failed</Text>
            <Text color="red" align="center">{errorMessage}</Text>
          </ErrorContainer>
        ) : (
          <SubtitleContainer>
            <IconWrapper>
              <Icon name="mail" color="primary500" size={22} />
            </IconWrapper>
            <Text align="center">We've sent you the verification code</Text>
            <Text align="center">
              If you haven't received it, we can send you another one.
            </Text>
          </SubtitleContainer>
        )}

        {counter > 0 ? (
          <Text align="center">
            You can resend the code in <Text bold>{counter} seconds.</Text>
          </Text>
        ) : (
          <Link color="primary" onPress={sendCode} bold>
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

    <ButtonContainer style={{ bottom: keyboardVisible ? 20 : bottomPadding }}>
      <Button
        label={loading ? 'Verifying' : 'Continue'}
        loading={loading}
        onPress={handleConfirmCode}
        full
        mv={12}
      />
    </ButtonContainer>
  </ScreenContainer>
);
}

export { ChangeEmailVerification };
