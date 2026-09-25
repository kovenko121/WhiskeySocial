import { Button, ConfirmationContainer } from '@components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from '@types';
import type { RootStackParams
} from '@types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header as HeaderComponent } from '../../Auth/components';
import { BottomButtonWrapper, SafeArea, ScreenContainer } from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'VenueRedeemConfirmation'>;

const VenueRedeemConfirmationScreen = ({ navigation, route }: Props) => {
  const { venueId } = route.params;
  const { bottom } = useSafeAreaInsets();

  return (
    <SafeArea>
      <ScreenContainer>
        <HeaderComponent noBack />

        <ConfirmationContainer
          icon="venue"
          title={`You request was${'\n'}succesfully sent!`}
          subtitle={`Whiskey Social® team will contact you as${'\n'}soon as possible to verify your request.`}
        />
      </ScreenContainer>
      <BottomButtonWrapper marginBottom={bottom}>
        <Button
          icon="venue"
          label="Return"
          onPress={() => {
            navigation.navigate(Routes.UserProfile, { id: venueId });
          }}
          full
        />
      </BottomButtonWrapper>
    </SafeArea>
  );
};

export { VenueRedeemConfirmationScreen };
