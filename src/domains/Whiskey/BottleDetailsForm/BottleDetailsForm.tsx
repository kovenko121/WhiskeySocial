import {
  Button,
  Header,
  Input,
  KeyboardAvoidingScroll,
  RadioGroup,
  Switch,
} from '@components';
import { yupResolver } from '@hookform/resolvers/yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PROOF_OPTIONS, ProofType, RootStackParams,
  Routes
} from '@types';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import {
  useAddWhiskeyToMyCollection,
  useGetUser,
  useUpdateMyCollectionWhiskey,
} from '@hooks';
import {
  BottomButtonWrapper,
  ContentContainer,
  HeaderWrapper,
  ScreenContainer,
} from './styles';

type BottleDetailsForm = {
  age?: string;
  batch?: string;
  bottle?: string;
  proof?: string;
  proofType?: ProofType;
  barrel?: string;
  rick?: string;
  warehouse?: string;
  singleBarrel?: boolean;
  storePick?: string;
  purchaseYear?: string;
  style?: string;
  notes?: string;
};

type Props = NativeStackScreenProps<RootStackParams, 'BottleDetailsForm'>;

const BottleDetailsFormScreen = ({ navigation, route }: Props) => {
  const { whiskey, bottle, from } = route.params;
  const { data: myUser } = useGetUser();
  const { mutate: addWhiskey, isPending: isAdding } =
    useAddWhiskeyToMyCollection(from);
  const currentYear = new Date().getFullYear();
  const { mutate, isPending: isEditing } = useUpdateMyCollectionWhiskey(
    () =>
      navigation.navigate(Routes.BottleDetails, {
        bottleId: bottle?.id,
        myUser,
      }),
    bottle?.id
  );

  const validationSchema = yup.object().shape({
    age: yup.string().trim().optional(),
    batch: yup.string().trim().optional(),
    bottle: yup.string().trim().optional(),
    proofType: yup
      .mixed<ProofType>()
      .oneOf(Object.values(ProofType))
      .optional(),
    proof: yup
      .string()
      .trim()
      .transform((value) => {
        if (value === '0' || (typeof value === 'string' && value.length <= 0))
          return undefined;
        return value;
      })
      .matches(/^[\d.]*$/, 'Proof can only contain numbers')
      .test(
        'is greater than or equal to 0',
        'Proof must be greater than or equal to 0',
        (value) => {
          if (value) {
            return parseFloat(value) >= 0;
          }
          return true;
        }
      )
      .test(
        'is less than or equal to 200',
        'Proof must be less than or equal to 200',
        (value) => {
          if (value) {
            return parseFloat(value) <= 200;
          }
          return true;
        }
      )
      .optional(),
    barrel: yup.string().trim().optional(),
    rick: yup.string().trim().optional(),
    warehouse: yup.string().trim().optional(),
    singleBarrel: yup.boolean().optional(),
    storePick: yup.string().trim().optional(),
    purchaseYear: yup
      .string()
      .trim()
      .matches(/^\d*$/, 'Purchase year can only contain numbers')
      .test(
        'is less than current year',
        'The purchase year cannot be higher than the current year',
        (value) => {
          if (value) {
            return parseFloat(value) <= currentYear;
          }
          return true;
        }
      ),
    style: yup.string().trim().optional(),
    notes: yup.string().trim().optional(),
  });

  const {
    clearErrors,
    getValues,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BottleDetailsForm>({
    resolver: yupResolver<BottleDetailsForm>(validationSchema),
  });

  const withoutErrors = errors && Object.keys(errors).length === 0;

  const onSubmit = async (formValues: BottleDetailsForm) => {
    if (withoutErrors) {
      // An emptied field must reach the API as an explicit null: `undefined` is
      // dropped at serialization and leaves the stored attribute untouched.
      const sanitizedData = {
        ...formValues,
        proof: formValues.proof ?? null,
      };

      if (from?.name === 'BottleDetails') {
        mutate({
          bottleId: bottle?.id,
          ...sanitizedData,
        });
        return;
      }
      if (
        myUser?.whiskeys?.items?.some(
          (item) => item?.whiskey?.id === whiskey?.id
        )
      ) {
        addWhiskey({
          whiskeyId: whiskey?.id,
          ...sanitizedData,
        });
      } else {
        // TODO: We need to fix this garbage TS errors
        navigation.navigate(Routes.ReviewWhiskey, {
          whiskey: {
            id: whiskey.id,
            name: whiskey.name,
            ...sanitizedData,
          },
        });
      }
    }
  };

  const onChange = (name: any, field: any) => {
    setValue(name, field);
    clearErrors(name);
  };

  const setPageTitle = (fromWhere: any) => {
    if (fromWhere) {
      return fromWhere?.name === 'BottleDetails'
        ? 'Edit Bottle Details'
        : 'Bottle Details';
    }
    return 'Bottle Details';
  };

  const setButtonLabel = (fromWhere: any) => {
    if (fromWhere) {
      return fromWhere?.name === 'BottleDetails'
        ? 'Save'
        : 'Add to My Collection';
    }
    return 'Add to My Collection';
  };

  const getAge = (whiskeyAge: number, bottleAge: number) => {
    if (whiskeyAge && !bottleAge) {
      return `${whiskeyAge}`;
    }
    if (bottleAge) {
      return `${bottleAge}`;
    }
    return undefined;
  };

  const getProof = (whiskeyProof: number, bottleProof: number) => {
    if (whiskeyProof && !bottleProof) {
      return `${whiskeyProof}`;
    }
    if (bottleProof) {
      return `${bottleProof}`;
    }
    return undefined;
  };

  const getProofType = (
    bottleProofType?: ProofType | null,
    bottleProof?: number
  ) => {
    // If bottle has explicit proofType, use it
    if (bottleProofType) {
      return bottleProofType;
    }
    // Legacy bottles: default to NUMERIC if they have a proof value
    if (bottleProof) {
      return ProofType.NUMERIC;
    }
    // New bottles: default to NUMERIC
    return ProofType.NUMERIC;
  };

  useEffect(() => {
    reset({
      age: getAge(whiskey?.age?.toString(), bottle?.age),
      batch: bottle?.batch ?? undefined,
      bottle: bottle?.bottle ?? undefined,
      proofType: getProofType(bottle?.proofType, bottle?.proof),
      proof: getProof(whiskey?.proof, bottle?.proof),
      barrel: bottle?.barrel ?? undefined,
      rick: bottle?.rick ?? undefined,
      warehouse: bottle?.warehouse ?? undefined,
      singleBarrel: bottle?.singleBarrel ?? whiskey?.singleBarrel ?? undefined,
      storePick: bottle?.storePick ?? undefined,
      purchaseYear: bottle?.purchaseYear ?? undefined,
      style: bottle?.style ?? undefined,
      notes: bottle?.notes ?? undefined,
    });
  }, [reset, whiskey, bottle]);

  useEffect(() => {
    register('age');
    register('batch');
    register('bottle');
    register('proofType');
    register('proof');
    register('barrel');
    register('rick');
    register('warehouse');
    register('singleBarrel');
    register('storePick');
    register('purchaseYear');
    register('style');
    register('notes');
  }, [register]);

  return (
    <ScreenContainer>
      <HeaderWrapper>
        <Header title={setPageTitle(from)} />
      </HeaderWrapper>
      <KeyboardAvoidingScroll>
        <ContentContainer>
          <Input
            onChangeText={(text) => onChange('age', text)}
            value={getValues('age')}
            mv={4}
            placeholder="Age"
            error={!!errors?.age}
            errorMessage={errors?.age?.message}
            maxLength={37}
          />
          <Input
            onChangeText={(text) => onChange('batch', text)}
            value={getValues('batch')}
            mv={4}
            placeholder="Batch #"
            error={!!errors?.batch}
            errorMessage={errors?.batch?.message}
            maxLength={37}
          />
          <Input
            onChangeText={(text) => onChange('bottle', text)}
            value={getValues('bottle')}
            mv={4}
            placeholder="Bottle #"
            error={!!errors?.bottle}
            errorMessage={errors?.bottle?.message}
            maxLength={37}
          />
          <RadioGroup
            options={[PROOF_OPTIONS[0]].map((opt) => ({ label: opt.label }))}
            activeButton={
              PROOF_OPTIONS.find((opt) => opt.value === getValues('proofType'))
                ?.label || PROOF_OPTIONS[0].label
            }
            onChange={(label: string) => {
              const selectedOption = PROOF_OPTIONS.find(
                (opt) => opt.label === label
              );
              if (selectedOption) {
                onChange('proofType', selectedOption.value);
              }
            }}
            mv={4}
          />
          <Input
            onChangeText={(text) => onChange('proof', text)}
            value={getValues('proof')}
            mv={4}
            placeholder="Proof"
            error={!!errors?.proof}
            errorMessage={errors?.proof?.message}
            maxLength={6}
            keyboardType="numbers-and-punctuation"
          />
          <RadioGroup
            options={PROOF_OPTIONS.slice(1).map((opt) => ({ label: opt.label }))}
            activeButton={
              PROOF_OPTIONS.find((opt) => opt.value === getValues('proofType'))
                ?.label || PROOF_OPTIONS[0].label
            }
            onChange={(label: string) => {
              const selectedOption = PROOF_OPTIONS.find(
                (opt) => opt.label === label
              );
              if (selectedOption) {
                onChange('proofType', selectedOption.value);
              }
            }}
            mv={0}
          />
          <Input
            onChangeText={(text) => onChange('barrel', text)}
            value={getValues('barrel')}
            mv={4}
            placeholder="Barrel #"
            error={!!errors?.barrel}
            errorMessage={errors?.barrel?.message}
            maxLength={37}
          />
          <Input
            onChangeText={(text) => onChange('rick', text)}
            value={getValues('rick')}
            mv={4}
            placeholder="Rick #"
            error={!!errors?.rick}
            errorMessage={errors?.rick?.message}
            maxLength={37}
          />
          <Input
            onChangeText={(text) => onChange('warehouse', text)}
            value={getValues('warehouse')}
            mv={4}
            placeholder="Warehouse"
            error={!!errors?.warehouse}
            errorMessage={errors?.warehouse?.message}
            maxLength={37}
          />
          <Input
            onChangeText={(text) => onChange('storePick', text)}
            value={getValues('storePick')}
            mv={4}
            placeholder="Store Pick"
            error={!!errors?.storePick}
            errorMessage={errors?.storePick?.message}
            maxLength={37}
          />
          <Switch
            label="Single Barrel Selection"
            initValue={getValues('singleBarrel') ?? false}
            onValueChange={(value) => onChange('singleBarrel', value)}
            showText={false}
          />
          <Input
            onChangeText={(text) => onChange('purchaseYear', text.trim())}
            value={getValues('purchaseYear')}
            mv={4}
            placeholder="Purchase Year"
            error={!!errors?.purchaseYear}
            errorMessage={errors?.purchaseYear?.message}
            maxLength={4}
            keyboardType="number-pad"
          />
          <Input
            onChangeText={(text) => onChange('style', text.trim())}
            value={getValues('style')}
            mv={4}
            placeholder="Style"
            error={!!errors?.style}
            errorMessage={errors?.style?.message}
            maxLength={90}
          />
          <Input
            onChangeText={(text) => onChange('notes', text)}
            value={getValues('notes')}
            mv={4}
            placeholder="Notes"
            error={!!errors?.notes}
            errorMessage={errors?.notes?.message}
            maxLength={150}
            multiline
            numberOfLines={3}
          />
        </ContentContainer>
      </KeyboardAvoidingScroll>
      <BottomButtonWrapper>
        <Button
          mv={18}
          label={setButtonLabel(from)}
          icon={from?.name === 'BottleDetails' ? undefined : 'wine'}
          iconSize={18}
          onPress={handleSubmit(onSubmit)}
          loading={isAdding || isEditing}
        />
      </BottomButtonWrapper>
    </ScreenContainer>
  );
};
export { BottleDetailsFormScreen };
