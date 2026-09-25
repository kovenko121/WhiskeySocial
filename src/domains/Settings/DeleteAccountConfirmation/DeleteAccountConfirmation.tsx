import { Button, ConfirmationContainer, Header } from '@components';
import { useAuth } from '@contexts';
import { BottomButtonWrapper, ScreenContainer } from './styles';

const DeleteAccountConfirmationScreen = () => {
  const { deleteUser } = useAuth();

  return (
    <ScreenContainer>
      <Header title="Account" />

      <ConfirmationContainer
        icon="trash"
        title="Deleting Account!"
        subtitle={`You'll now be taken to the splash screen, where you${'\n'}can create a new account if you want. We really hope${'\n'}to see you again soon.`}
      />

      <BottomButtonWrapper>
        <Button label="Exit" onPress={deleteUser} full />
      </BottomButtonWrapper>
    </ScreenContainer>
  );
};

export { DeleteAccountConfirmationScreen };
