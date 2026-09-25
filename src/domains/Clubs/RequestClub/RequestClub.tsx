import {
  Button,
  Header,
  Input,
  KeyboardAvoidingContainer,
  SubTitle,
  Text,
} from '@components';
import { useAuth } from '@contexts';
import { yupResolver } from '@hookform/resolvers/yup';
import { checkClubNameExists, useCreateClubRequest, useDebounce } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '@types';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Switch } from 'react-native';
import * as yup from 'yup';
import { createLogger } from '../../../services/logger';
import {
  BottomButtonWrapper,
  ContentContainer,
  PositionContainer,
  PrivacyRow,
  ScreenContainer,
} from './styles';

type ClubRequestForm = {
  clubName: string;
  description: string;
  location?: string;
  currentMemberCount?: string;
  isPrivate: boolean;
};

type Props = NativeStackScreenProps<RootStackParams, 'RequestClub'>;

const logger = createLogger('RequestClub');

const RequestClubScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const { mutate: createClubRequest, isPending } = useCreateClubRequest();
  const [isPrivate, setIsPrivate] = useState(false);
  const [clubNameError, setClubNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [clubNameValue, setClubNameValue] = useState('');
  const debouncedClubName = useDebounce(clubNameValue, 500);

  const validationSchema: yup.ObjectSchema<ClubRequestForm> = yup.object().shape({
    clubName: yup
      .string()
      .trim()
      .required('Club name is required')
      .min(3, 'Club name must be at least 3 characters')
      .max(50, 'Club name must be at most 50 characters'),
    description: yup
      .string()
      .trim()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(100, 'Description must be at most 100 characters'),
    location: yup.string().optional(),
    currentMemberCount: yup
      .string()
      .optional()
      .test('valid-number', 'Must be a valid number', (value) => {
        if (!value || value.trim() === '') return true;
        return /^\d+$/.test(value);
      })
      .test('min', 'Must be at least 1', (value) => {
        if (!value || value.trim() === '') return true;
        return parseInt(value, 10) >= 1;
      })
      .test('max', 'Must be at most 1,000,000', (value) => {
        if (!value || value.trim() === '') return true;
        return parseInt(value, 10) <= 1000000;
      }),
    isPrivate: yup.boolean().required(),
  });

  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ClubRequestForm>({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      isPrivate: false,
    },
  });

  const onChange = (name: keyof ClubRequestForm, value: any) => {
    setValue(name, value, { shouldValidate: true });

    if (name === 'clubName') {
      setClubNameValue(value);
      // Don't clear the error immediately - let the debounced check handle it
    }
  };

  // Check club name uniqueness with debounce
  useEffect(() => {
    const checkName = async () => {
      if (!debouncedClubName || debouncedClubName.trim().length < 3) {
        setClubNameError(null);
        return;
      }

      setIsCheckingName(true);
      try {
        const exists = await checkClubNameExists(debouncedClubName);
        setIsCheckingName(false);

        if (exists) {
          setClubNameError('A club with this name already exists');
        } else {
          setClubNameError(null);
        }
      } catch (error) {
        setIsCheckingName(false);
        setClubNameError('Unable to verify club name availability');
        logger.error('Error checking club name:', error as Error);
      }
    };

    checkName();
  }, [debouncedClubName]);

  const onSubmit = async (dataForm: ClubRequestForm) => {
    // Double-check club name uniqueness before submission
    if (clubNameError) {
      Alert.alert(
        'Club Name Taken',
        'A club with this name already exists. Please choose a different name.'
      );
      return;
    }

    createClubRequest(
      {
        clubName: dataForm.clubName,
        description: dataForm.description,
        location: dataForm.location || '',
        currentMemberCount: dataForm.currentMemberCount
          ? parseInt(dataForm.currentMemberCount, 10)
          : 0,
        isPrivate,
        requestedBy: user.sub,
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Request Submitted',
            'Your club request has been submitted successfully. We will review it and get back to you soon.',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        },
        onError: (error) => {
          Alert.alert(
            'Error',
            'Failed to submit club request. Please try again.'
          );
          logger.error('Club request error:', error as Error);
        },
      }
    );
  };

  useEffect(() => {
    register('clubName');
    register('description');
    register('location');
    register('currentMemberCount');
    register('isPrivate');
  }, [register]);

  return (
    <ScreenContainer>
      <KeyboardAvoidingContainer>
        <>
          <ContentContainer>
            <PositionContainer>
              <Header />
            </PositionContainer>

            <SubTitle color="primary500" center size={27} mt={16}>
              Create a Club
            </SubTitle>
            <Text align="center" mv={16}>
              Tell us about the club you'd like to create{'\n'}on Whiskey
              Social®
            </Text>

            <Input
              placeholder="Club Name"
              value={getValues('clubName')}
              onChangeText={(text: string) => onChange('clubName', text)}
              error={!!errors?.clubName || !!clubNameError}
              errorMessage={errors?.clubName?.message || clubNameError || undefined}
              mv={6}
              maxLength={50}
            />
            {isCheckingName && (
              <Text size={12} color="grey300" mv={4}>
                Checking availability...
              </Text>
            )}
            {!isCheckingName && clubNameValue.length >= 3 && !clubNameError && !errors?.clubName && (
              <Text size={12} color="success" mv={4}>
                Club name is available
              </Text>
            )}

            <Input
              placeholder="Description"
              value={getValues('description')}
              onChangeText={(text: string) => onChange('description', text)}
              error={!!errors?.description}
              errorMessage={errors?.description?.message}
              mv={6}
              maxLength={100}
              multiline
              numberOfLines={4}
            />

            <Input
              placeholder="Location (Optional)"
              value={getValues('location')}
              onChangeText={(text: string) => onChange('location', text)}
              error={!!errors?.location}
              errorMessage={errors?.location?.message}
              mv={6}
              maxLength={100}
            />

            <Input
              placeholder="Current Member Count (Optional)"
              value={getValues('currentMemberCount')}
              onChangeText={(text: string) => onChange('currentMemberCount', text)}
              error={!!errors?.currentMemberCount}
              errorMessage={errors?.currentMemberCount?.message}
              mv={6}
              keyboardType="number-pad"
              maxLength={10}
            />

            <PrivacyRow>
              <Text size={16}>Private Club</Text>
              <Switch
                value={isPrivate}
                onValueChange={(value) => {
                  setIsPrivate(value);
                  onChange('isPrivate', value);
                }}
              />
            </PrivacyRow>
            <Text size={12} color="grey300" mv={4}>
              Private clubs require approval to join
            </Text>
          </ContentContainer>

          <BottomButtonWrapper>
            <Button
              label="Submit Request"
              onPress={handleSubmit(onSubmit)}
              full
              loading={isPending}
              disabled={isPending || isCheckingName || !!clubNameError || !isValid}
            />
          </BottomButtonWrapper>
        </>
      </KeyboardAvoidingContainer>
    </ScreenContainer>
  );
};

export { RequestClubScreen };
