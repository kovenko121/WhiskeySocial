import { Button, Header, Icon, Text, Title } from '@components';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { type RootStackParams,
  Routes
} from '@types';
import {
  BottomButtonWrapper,
  ContentContainer,
  ScreenContainer,
  SubtitleContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'SuggestionConfirmed'>;

const SuggestionConfirmedScreen = ({ navigation }: Props) => {
  const continueHandler = () => {
    navigation.navigate(Routes.MyCollection);
  };

  return (
    <ScreenContainer>
      <Header title="Suggest New Whiskey" navBack={continueHandler} />

      <ContentContainer>
        <Icon name="wine" color="primary500" size={80} />
        <Title color="primary">Thanks!</Title>

        <SubtitleContainer>
          <Text align="center">You'll be notified when this whiskey</Text>
          <Text align="center">is available in our catalog.</Text>
        </SubtitleContainer>
      </ContentContainer>

      <BottomButtonWrapper>
        <Button
          label="Return to My Collection"
          onPress={continueHandler}
          full
        />
      </BottomButtonWrapper>
    </ScreenContainer>
  );
};

export { SuggestionConfirmedScreen };
