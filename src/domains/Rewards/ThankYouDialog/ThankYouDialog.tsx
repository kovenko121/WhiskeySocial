import { Button, Link, ModalBottom, Text, Title } from '@components';
import RewardIcon from '../../../../assets/images/reward-icon.png';
import {
  ButtonContainer,
  ContentContainer,
  RewardImage,
  RewardImageContainer,
  SubtitleContainer,
  TitleContainer,
} from './styles';

const ThankYouDialog = ({
  visible,
  onBackButtonPress,
}: {
  visible: boolean;
  onBackButtonPress: () => void;
}) => {
  const closeModal = () => {
    onBackButtonPress();
  };

  return (
    <ModalBottom onBackButtonPress={closeModal} visible={visible}>
      <ContentContainer>
        <Link color="primary500" bold onPress={() => onBackButtonPress()}>
          Close
        </Link>
        <RewardImageContainer>
          <RewardImage source={RewardIcon} />
        </RewardImageContainer>

        <TitleContainer>
          <Title size={27} align="center">
            Thank you for your participation!
          </Title>
        </TitleContainer>

        <SubtitleContainer>
          <Text mv={4} align="center" size={12}>
            WS Rewards was a huge success {'\n'} and all available prizes just
            got redeemed. {'\n'} But don't worry, we'll be back soon with more
            prizes!
          </Text>
        </SubtitleContainer>

        <SubtitleContainer>
          <Text mv={16} align="center" size={9}>
            Redeemed prizes tracking information can be checked in your e-mail.
          </Text>
        </SubtitleContainer>
      </ContentContainer>
      <ButtonContainer>
        <Button
          label="Close WS Rewards"
          icon="close"
          iconSize={20}
          onPress={closeModal}
        />
      </ButtonContainer>
    </ModalBottom>
  );
};
export { ThankYouDialog };
