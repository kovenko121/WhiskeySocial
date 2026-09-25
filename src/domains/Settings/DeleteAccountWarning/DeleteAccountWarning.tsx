import { ConfirmationContainer, Header } from '@components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from '@types';
import type { RootStackParams
} from '@types';
import { Buttons } from '../components';
import { ScreenContainer } from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'DeleteAccountWarning'>;

const DeleteAccountWarningScreen = ({ navigation }: Props) => {
  const cancelHandler = () => {
    navigation.navigate(Routes.AccountSettings);
  };

  const continueHandler = () => {
    navigation.navigate(Routes.DeleteAccountConfirmation);
  };

  return (
    <ScreenContainer>
      <Header title="Account" />

      <ConfirmationContainer
        icon="alert-sign"
        title={`Your data will be ${'\n'} permanently lost!`}
        subtitle={`If you wish to come back later, you'll need to start over${'\n'}from beginning, so make sure this is what you want`}
      />

      <Buttons
        cancelHandler={cancelHandler}
        continueHandler={continueHandler}
        continueLabel="I'm sure of it."
      />
    </ScreenContainer>
  );
};

export { DeleteAccountWarningScreen };
