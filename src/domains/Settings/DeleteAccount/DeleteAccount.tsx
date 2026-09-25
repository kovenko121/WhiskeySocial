import { ConfirmationContainer, Header } from '@components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from '@types';
import type { RootStackParams
} from '@types';
import { Buttons } from '../components';
import { ScreenContainer } from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'DeleteAccount'>;

const DeleteAccountScreen = ({ navigation }: Props) => {
  const cancelHandler = () => {
    navigation.navigate(Routes.AccountSettings);
  };

  const continueHandler = () => {
    navigation.navigate(Routes.DeleteAccountWarning);
  };

  return (
    <ScreenContainer>
      <Header title="Account" />

      <ConfirmationContainer
        icon="alert-sign"
        title="Deleting Account!"
        subtitle={`If you continue, your account is going to be deleted.${'\n'}Are you sure you want to continue?`}
      />

      <Buttons
        cancelHandler={cancelHandler}
        continueHandler={continueHandler}
        continueLabel="I'm sure of it."
      />
    </ScreenContainer>
  );
};

export { DeleteAccountScreen };
