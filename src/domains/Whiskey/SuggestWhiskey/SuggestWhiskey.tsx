import {
  Button,
  Header,
  Input,
  KeyboardAvoidingScroll,
  Text,
  Title,
} from '@components';
import { uploadPicture } from '@helpers';
import { yupResolver } from '@hookform/resolvers/yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { type RootStackParams,
  Routes
} from '@types';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import {
  BottomButtonWrapper,
  ContentContainer,
  FormContainer,
  InputContainer,
  ScreenContainer,
  TitleContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'SuggestWhiskey'>;

type SuggestionForm = {
  barcode?: string;
  name: string;
  brand: string;
  years: string;
};

export const SuggestWhiskeyScreen = ({ navigation, route }: Props) => {
  const prefill = route.params;

  const validationSchema = yup.object().shape({
    barcode: yup
      .string()
      .trim()
      .matches(/^[0-9]+$/, 'Barcode can only contain numbers'),
    name: yup.string().trim().required('Name is required'),
    brand: yup.string().trim().required('Brand is required'),
    years: yup
      .string()
      .trim()
      .required('Username is required')
      .matches(/^[0-9]+$/, 'Years can only contain numbers'),
  });

  const {
    clearErrors,
    getValues,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SuggestionForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      brand: prefill?.brand ?? '',
      name: prefill?.name ?? '',
      years: prefill?.years ?? '',
    },
  });

  const onChange = (name: any, field: any) => {
    setValue(name, field);
    clearErrors(name);
  };

  const withoutErrors = errors && Object.keys(errors).length === 0;

  const onSubmit = async (dataForm: SuggestionForm) => {
    if (withoutErrors) {
      const picture = prefill?.imageUri
        ? { uri: prefill.imageUri }
        : await uploadPicture();

      if (picture) {
        navigation.navigate(Routes.ConfirmSuggestion, {
          whiskeyPicture: picture,
          name: dataForm.name || '',
          brand: dataForm.brand || '',
          years: dataForm.years || '',
          barcode: dataForm.barcode || '',
        });
      }
    }
  };

  useEffect(() => {
    register('barcode');
    register('name');
    register('brand');
    register('years');
  }, [register]);

  useEffect(() => {
    if (prefill?.brand) setValue('brand', prefill.brand);
    if (prefill?.name) setValue('name', prefill.name);
    if (prefill?.years) setValue('years', prefill.years);
  }, [prefill, setValue]);

  return (
    <ScreenContainer>
      <Header title="Suggest New Whiskey" />
      <KeyboardAvoidingScroll>
        <ContentContainer>
          <TitleContainer>
            <Title color="primary500">Fill the Whiskey Info</Title>
            <Text align="center">
              This will help us to make this bottle available as fast {'\n'} as
              possible, so other users can view and use it too.
            </Text>
          </TitleContainer>
          <FormContainer>
            <InputContainer>
              <Input
                label="Barcode"
                iconSize={25}
                value={getValues('barcode')}
                onChangeText={(text) => onChange('barcode', text)}
                error={!!errors?.barcode}
                errorMessage={errors?.barcode?.message}
                maxLength={50}
              />
            </InputContainer>
            <InputContainer>
              <Input
                label="Name"
                iconSize={25}
                value={getValues('name')}
                onChangeText={(text) => onChange('name', text)}
                error={!!errors?.name}
                errorMessage={errors?.name?.message}
                maxLength={50}
              />
            </InputContainer>
            <InputContainer>
              <Input
                label="Brand"
                iconSize={25}
                value={getValues('brand')}
                onChangeText={(text) => onChange('brand', text)}
                error={!!errors?.brand}
                errorMessage={errors?.brand?.message}
                maxLength={50}
              />
            </InputContainer>
            <InputContainer>
              <Input
                label="Years (only numbers)"
                iconSize={25}
                value={getValues('years')}
                onChangeText={(text) => onChange('years', text)}
                error={!!errors?.years}
                errorMessage={errors?.years?.message}
                maxLength={4}
                keyboardType="number-pad"
              />
            </InputContainer>
          </FormContainer>
        </ContentContainer>
      </KeyboardAvoidingScroll>
      <BottomButtonWrapper>
        <Button
          label="Continue"
          iconSpacing={false}
          disabled={!withoutErrors}
          onPress={handleSubmit(onSubmit)}
          full
        />
      </BottomButtonWrapper>
    </ScreenContainer>
  );
};
