import { Button, Icon, Text, Title } from '@components';
import { useAuth } from '@contexts';
import {
  BottomButtonWrapper,
  ContentContainer,
  ScreenContainer,
  SubtitleContainer,
} from './styles';

const ChangeEmailConfirmationScreen = () => {
  const { signOut } = useAuth();

  return (
    <ScreenContainer>
      <ContentContainer>
        <Icon name="lock" color="primary500" size={62} />
        <Title size={27} color="primary">
          Email changed!
        </Title>

        <SubtitleContainer>
          <Text align="center">You'll now be disconnected.</Text>
          <Text align="center">Login again to continue.</Text>
        </SubtitleContainer>
      </ContentContainer>

      <BottomButtonWrapper>
        <Button label="Continue" onPress={signOut} full />
      </BottomButtonWrapper>
    </ScreenContainer>
  );
};

export { ChangeEmailConfirmationScreen };
