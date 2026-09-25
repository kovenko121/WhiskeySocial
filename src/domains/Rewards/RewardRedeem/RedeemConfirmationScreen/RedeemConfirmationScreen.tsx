import { Button, Header, Icon, Text, Title } from '@components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams,
  Routes
} from '@types';
import {
  ContentContainer,
  ScreenContainer,
  TitleSubtitleContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'RedeemConfirmation'>;

const RedeemConfirmationScreen = ({ navigation }: Props) => {
  const returnToRewards = () => {
    // Reset the stack instead of navigating, otherwise the redeem-flow
    // screens (including this one) stay underneath ActiveRewards and the
    // user gets bounced back here on every back press — an inescapable loop.
    navigation.reset({
      index: 1,
      routes: [{ name: Routes.Home }, { name: Routes.ActiveRewards }],
    });
  };

  return (
    <ScreenContainer>
      <ContentContainer>
        <Header
          title="WS Rewards"
          navBack={returnToRewards}
        />

        <TitleSubtitleContainer>
          <Icon name="truck" size={80} color="primary" />
          <Title mt={40} size={27}>
            Prize Redeemed Succesfully
          </Title>
          <Text mv={4} align="center" size={12}>
            You'll receive your tracking code when the order is available. We'll
            also send you an e-mail with the details.
          </Text>
        </TitleSubtitleContainer>

        <Button
          label="Return to Rewards"
          icon="trophy"
          iconSize={18}
          onPress={returnToRewards}
          mv={0}
        />
      </ContentContainer>
    </ScreenContainer>
  );
};
export { RedeemConfirmationScreen };
