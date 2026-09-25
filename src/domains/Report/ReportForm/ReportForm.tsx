import {
  Button,
  Header,
  Input,
  KeyboardAvoidingScroll,
  RadioGroup,
  Text,
} from '@components';
import { useGetUser } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams, UserType,
  Routes
} from '@types';
import { useEffect, useState } from 'react';
import {
  BottomButtonWrapper,
  ButtonWrapper,
  ContentContainer,
  FormContainer,
  RadioGroupContainer,
  ScreenContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'ReportForm'>;

export const ReportFormScreen = ({ navigation, route }: Props) => {
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const { data: user } = useGetUser(route.params.reportedUserId);

  const onSubmit = () => {
    if (reason === 'Other' && description.length === 0) {
      setErrorMessage('If you select other, you must describe the reason');
      return;
    }

    if (reason.length === 0) {
      setErrorMessage('You must select a category');
      return;
    }

    navigation.navigate(Routes.ReportConfirmation, {
      ...route.params,
      ownerName:
        user?.userType === UserType.VENUE
          ? `${user?.venueName}`
          : `${user?.personFirstName} ${user?.personLastName}`,
      reason,
      description,
    });
  };

  useEffect(() => {
    setErrorMessage('');
    setDescription('');
  }, [reason]);

  useEffect(() => {
    setErrorMessage('');
  }, [description]);

  const options = [
    { label: `It's spam` },
    { label: 'Nudity or sexual activity' },
    { label: 'Symbols or hate speech' },
    { label: 'Fake news' },
    { label: 'Bullying or harassment' },
    { label: 'Other' },
  ];

  return (
    <ScreenContainer>
      <Header title="Report" />
      <KeyboardAvoidingScroll>
        <>
          <ContentContainer>
            <Text size={12} align="center">
              Your anonymous report will be moderated. If confirmed, the content
              will be removed within 24 hours. If in immediate danger, call
              emergency services.
            </Text>

            <RadioGroupContainer>
              <RadioGroup
                options={options}
                activeButton={reason}
                onChange={setReason}
              />
            </RadioGroupContainer>
            <Text size={13} align="center" color="red">
              {errorMessage}
            </Text>
            <FormContainer>
              {reason === 'Other' && (
                <Input
                  labelSize={18}
                  placeholder="What are you trying to report?"
                  color="neutral600"
                  value={description}
                  numberOfLines={3}
                  error={!!errorMessage}
                  onChangeText={(text) => setDescription(text)}
                  maxLength={200}
                  counter={`${description ? 200 - description!.length : 200}`}
                />
              )}
            </FormContainer>
          </ContentContainer>
          <BottomButtonWrapper>
            <ButtonWrapper>
              <Button
                label="Cancel"
                onPress={navigation.goBack}
                variant="outlineDefault"
                full
              />
            </ButtonWrapper>
            <ButtonWrapper>
              <Button label="Continue" onPress={onSubmit} full />
            </ButtonWrapper>
          </BottomButtonWrapper>
        </>
      </KeyboardAvoidingScroll>
    </ScreenContainer>
  );
};
