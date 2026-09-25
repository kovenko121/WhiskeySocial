import {
  Button,
  Checkbox,
  Header,
  Input,
  InputDropdown,
  KeyboardAvoidingScroll,
  Text,
  Title,
} from '@components';
import { capitalize, getTestId } from '@helpers';
import { yupResolver } from '@hookform/resolvers/yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams,
  Routes
} from '@types';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import {
  BottomButtonWrapper,
  CheckboxContainer,
  ContentContainer,
  HeaderWrapper,
  ScreenContainer,
  SubtitleContainer,
  TitleContainer,
} from './styles';

type ShippingInfoForm = {
  shirtSize: string | undefined;
  shirtModel: string | undefined;
  fullName: string;
  email: string;
  addressFirst: string;
  addressSecond: string | undefined;
  cityName: string;
  stateName: string;
  zipcode: string;
};

type Props = NativeStackScreenProps<RootStackParams, 'ShippingInfo'>;
const ShippingInfoScreen = ({ navigation, route }: Props) => {
  const getSizesAndModels = (array: string[]) =>
    array.map((item) => ({
      label: capitalize(item),
      value: capitalize(item),
    }));

  const shirtSizes =
    route.params.sizes !== null ? getSizesAndModels(route.params.sizes) : [];

  const shirtModels =
    route.params.models !== null ? getSizesAndModels(route.params.models) : [];

  const [agreements, setAgreements] = useState<boolean>(false);
  const showTshirtOptions = route.params.isTshirt;

  const validationSchema = yup.object().shape({
    shirtSize: showTshirtOptions
      ? yup.string().trim().required('Shirt size is required')
      : yup.string().trim(),
    shirtModel: showTshirtOptions
      ? yup.string().trim().required('Shirt model is required')
      : yup.string().trim(),
    fullName: yup
      .string()
      .trim()
      .matches(/^[^0-9]*$/, "Full name can't contain numbers")
      .required('Full name is required'),
    email: yup
      .string()
      .trim()
      .required('E-mail is required')
      .matches(
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
        'E-mail not valid'
      ),
    addressFirst: yup.string().trim().required('Address is required'),
    addressSecond: yup.string().trim(),
    cityName: yup.string().trim().required('City name is required'),
    stateName: yup.string().trim().required('State name is required'),
    zipcode: yup.string().trim().required('Zipcode is required'),
  });

  const {
    clearErrors,
    getValues,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ShippingInfoForm>({
    resolver: yupResolver(validationSchema),
  });

  const withoutErrors = errors && Object.keys(errors).length === 0;

  const onSubmit = async (dataForm: ShippingInfoForm) => {
    if (withoutErrors) {
      navigation.navigate(Routes.ReviewShippingInfo, {
        rewardId: route.params.rewardId,
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
    register('shirtSize');
    register('shirtModel');
    register('email');
    register('addressFirst');
    register('addressSecond');
    register('cityName');
    register('stateName');
    register('zipcode');
  }, [register]);

  return (
    <ScreenContainer>
      <HeaderWrapper>
        <Header title="WS Rewards" />
      </HeaderWrapper>
      <KeyboardAvoidingScroll extraHeight={0}>
        <>
          <ContentContainer>
            <TitleContainer>
              <Title size={27} align="center">
                Shipping Info
              </Title>
            </TitleContainer>

            <SubtitleContainer>
              <Text mv={4} align="center" size={12}>
                Thank you for helping us to build a live community for whiskey
                enthusiasts. Now tell us where you live, so we can send your
                prize (US citizens only).
              </Text>
            </SubtitleContainer>
            {showTshirtOptions && (
              <>
                <InputDropdown
                  mv={4}
                  options={shirtSizes}
                  placeHolder="Shirt Size"
                  setSelected={(value) => {
                    onChange('shirtSize', value.value);
                  }}
                  zIndex={2}
                  error={!!errors?.shirtSize}
                  errorMessage={errors?.shirtSize?.message}
                />
                <InputDropdown
                  mv={6}
                  options={shirtModels}
                  placeHolder="Model"
                  setSelected={(value) => {
                    onChange('shirtModel', value.value);
                  }}
                  zIndex={1}
                  error={!!errors?.shirtModel}
                  errorMessage={errors?.shirtModel?.message}
                />
              </>
            )}
            <Input
              onChangeText={(text) => onChange('fullName', text)}
              value={getValues('fullName')}
              mv={4}
              placeholder="Full Name"
              error={!!errors?.fullName}
              errorMessage={errors?.fullName?.message}
              maxLength={100}
            />
            <Input
              onChangeText={(text) => onChange('email', text)}
              value={getValues('email')}
              mv={4}
              placeholder="E-mail"
              error={!!errors?.email}
              errorMessage={errors?.email?.message}
              maxLength={50}
            />
            <Input
              value={getValues('addressFirst')}
              mv={4}
              placeholder="Address"
              onChangeText={(text) => onChange('addressFirst', text)}
              error={!!errors?.addressFirst}
              errorMessage={errors?.addressFirst?.message}
              maxLength={100}
            />
            <Input
              value={getValues('addressSecond')}
              mv={4}
              placeholder="Address 2"
              onChangeText={(text) => onChange('addressSecond', text)}
              error={!!errors?.addressSecond}
              errorMessage={errors?.addressSecond?.message}
              maxLength={100}
            />
            <Input
              onChangeText={(text) => onChange('cityName', text)}
              value={getValues('cityName')}
              mv={4}
              placeholder="City"
              error={!!errors?.cityName}
              errorMessage={errors?.cityName?.message}
              maxLength={50}
            />
            <Input
              onChangeText={(text) => onChange('stateName', text)}
              value={getValues('stateName')}
              mv={4}
              placeholder="State"
              error={!!errors?.stateName}
              errorMessage={errors?.stateName?.message}
              maxLength={50}
            />
            <Input
              onChangeText={(text) => onChange('zipcode', text)}
              value={getValues('zipcode')}
              mv={4}
              placeholder="Zipcode"
              error={!!errors?.zipcode}
              errorMessage={errors?.zipcode?.message}
              maxLength={12}
              keyboardType="numeric"
            />
          </ContentContainer>
          <BottomButtonWrapper>
            <CheckboxContainer>
              <Checkbox
                testID={getTestId('check-box')}
                value={agreements}
                onValueChange={(val: boolean) => setAgreements(val)}
              />
              <Text size={12}>I agree to the Participation Terms</Text>
            </CheckboxContainer>

            <Button
              mv={18}
              label="Continue to Review"
              icon="truck"
              iconSize={18}
              onPress={handleSubmit(onSubmit)}
              disabled={!agreements}
            />
          </BottomButtonWrapper>
        </>
      </KeyboardAvoidingScroll>
    </ScreenContainer>
  );
};
export { ShippingInfoScreen };
