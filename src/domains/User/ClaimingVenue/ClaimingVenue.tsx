import {
  Button,
  Checkbox,
  Header,
  Input,
  KeyboardAvoidingScroll,
  SubTitle,
  Text,
} from '@components';
import { yupResolver } from '@hookform/resolvers/yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams,
  Routes
} from '@types';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import {
  ButtonContainer,
  ConfirmContainer,
  ContentContainer,
  FormContainer,
  HeaderConteiner,
  ScreenContainer,
} from './styles';

type VenueRequestForm = {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string | undefined;
};
type Props = NativeStackScreenProps<RootStackParams, 'ClaimingVenue'>;

const ClaimingVenueScreen = ({ navigation, route }: Props) => {
  const { venueId } = route.params;
  const [confirmation, setConfirmation] = useState(false);
  const [confirmationError, setConfirmationError] = useState('');
  const validationSchema = yup.object().shape({
    fullName: yup.string().trim().required('Full Name is required'),
    email: yup
      .string()
      .trim()
      .required('Email is required')
      .matches(
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
        'Email not valid'
      ),
    phone: yup
      .string()
      .trim()
      .required('Phone Number is required')
      .matches(/^\d+$/, 'Phone Number can only contain numbers'),
    countryCode: yup.string().trim(),
  });

  const {
    clearErrors,
    getValues,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VenueRequestForm>({
    resolver: yupResolver(validationSchema),
  });

  const withoutErrors = errors && Object.keys(errors).length === 0;

  const onSubmit = async (dataForm: VenueRequestForm) => {
    if (!confirmation) {
      setConfirmationError('You need to confirm the claiming');
      return;
    }

    if (withoutErrors) {
      navigation.navigate(Routes.ClaimingVenueInfoConfirmation, {
        venueId,
        ...dataForm,
      });
    }
  };

  const onChange = (name: any, field: any) => {
    setValue(name, field);
    clearErrors(name);
  };

  useEffect(() => {
    register('fullName');
    register('email');
    register('phone');
    register('countryCode');
  }, [register]);

  useEffect(() => {
    setConfirmationError('');
  }, [confirmation]);

  return (
    <ScreenContainer>
      <HeaderConteiner>
        <Header title="Claiming Venue" />
      </HeaderConteiner>
      <KeyboardAvoidingScroll>
        <ContentContainer>
          <SubTitle color="primary500" center size={27} mt={32}>
            Owner Info
          </SubTitle>
          <Text align="center" mv={16}>
            Thank you for helping us to build a live community for whiskey
            enthusiasts. Now tell us where you live, so we can send your prize
            (US citizens only).
          </Text>
          <FormContainer>
            <Input
              placeholder="Full Name"
              labelSize={18}
              color="neutral600"
              value={getValues('fullName')}
              onChangeText={(text: string) => onChange('fullName', text)}
              error={!!errors?.fullName}
              errorMessage={errors?.fullName?.message}
              maxLength={40}
            />

            <Input
              placeholder="Email"
              labelSize={18}
              color="neutral600"
              value={getValues('email')}
              onChangeText={(text) => onChange('email', text)}
              error={!!errors?.email}
              errorMessage={errors?.email?.message}
              maxLength={40}
            />

            <Input
              placeholder="Phone Number"
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
              onCountryChange={(text: string) => onChange('countryCode', text)}
            />
          </FormContainer>
        </ContentContainer>
      </KeyboardAvoidingScroll>
      <ButtonContainer>
        <ConfirmContainer>
          <Checkbox value={confirmation} onValueChange={setConfirmation} />
          <Text align="center" onPress={() => setConfirmation(!confirmation)}>
            I confirm this claiming is genuine.
          </Text>
        </ConfirmContainer>
        {confirmationError && (
          <ConfirmContainer>
            <Text color="red" align="center" mb={16}>
              {confirmationError}
            </Text>
          </ConfirmContainer>
        )}
        <Button
          label="Confirm Claiming"
          iconSize={22}
          onPress={handleSubmit(onSubmit)}
          mh={24}
          icon="venue"
        />
      </ButtonContainer>
    </ScreenContainer>
  );
};

export { ClaimingVenueScreen };
