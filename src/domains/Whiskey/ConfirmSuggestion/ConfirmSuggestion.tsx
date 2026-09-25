import {
  Button,
  Divider,
  Header,
  KeyboardAvoidingScroll,
  Text,
  Title,
} from '@components';
import { capitalize, getBlob } from '@helpers';
import { createImageKey } from '@whiskey-social/image-keys';
import { useCreateWhiskeySuggestion } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { type RootStackParams,
  Routes
} from '@types';
import { Storage } from 'aws-amplify';
import {
  BottomButtonWrapper,
  ButtonWrapper,
  ContentContainer,
  DataContainer,
  Field,
  Image,
  ImageContainer,
  ScreenContainer,
  Spacing,
  TitleContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'ConfirmSuggestion'>;

export const ConfirmSuggestionScreen = ({ navigation, route }: Props) => {
  const { whiskeyPicture: picture, ...information } = route.params;

  const { mutate, isLoading } = useCreateWhiskeySuggestion(
    'SuggestionConfirmed'
  );

  const cancelHandler = () => {
    navigation.navigate(Routes.SuggestWhiskey);
  };

  const continueHandler = async () => {
    const fileName = picture?.uri?.split('/').pop() as string;
    const blob = await getBlob(picture.uri);

    const prefixedFileName = createImageKey('whiskey', fileName);
    Storage.put(prefixedFileName, blob, { level: 'public' });

    mutate({ ...route.params, whiskeyPicture: prefixedFileName });
  };

  return (
    <ScreenContainer>
      <Header title="Suggest New Whiskey" />
      <KeyboardAvoidingScroll>
        <ContentContainer>
          <TitleContainer>
            <Title color="primary500">Confirm Data</Title>
            <Text align="center">
              This will help us to make this bottle available as fast {'\n'} as
              possible, so other users can view and use it too.
            </Text>
          </TitleContainer>
          <ImageContainer>
            <Image source={picture} />
          </ImageContainer>
          <DataContainer>
            {Object.entries(information).map(([key, value]) => (
              <>
                <Field>
                  <Spacing>
                    <Text bold size={14}>
                      {capitalize(key)}:
                    </Text>
                  </Spacing>
                  <Text size={14}>{value}</Text>
                </Field>
                {key !== 'barcode' && <Divider />}
              </>
            ))}
          </DataContainer>
        </ContentContainer>
      </KeyboardAvoidingScroll>
      <BottomButtonWrapper>
        <ButtonWrapper>
          <Button
            label="Cancel"
            onPress={cancelHandler}
            variant="outlineDefault"
            full
          />
        </ButtonWrapper>
        <ButtonWrapper>
          <Button
            label="Continue"
            onPress={continueHandler}
            full
            loading={isLoading}
          />
        </ButtonWrapper>
      </BottomButtonWrapper>
    </ScreenContainer>
  );
};
