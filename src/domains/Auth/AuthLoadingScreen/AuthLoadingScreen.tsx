import { LoadingAd, LoadingComponent } from '@components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { takePendingDestination } from '@services';
import { NavigationProps, RootStackParams,
  Routes
} from '@types';
import { useEffect } from 'react';
import { SafeArea, SponsorContainer } from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'AuthLoading'>;

const AuthLoadingScreen = ({ route }: Props) => {
  const navigation = useNavigation<NavigationProps>();
  useEffect(() => {
    if (route?.params?.time) {
      setTimeout(async () => {
        navigation.navigate(Routes.Home);

        // Every sign-in lands on this screen before Home, so it is the one place that can
        // finish the journey a guest started: whatever the auth gate interrupted opens on
        // top of Home, with Home still behind it to go back to.
        const destination = await takePendingDestination();
        if (destination) {
          // TypeScript can't pair a name with its own params across the union.
          navigation.navigate(destination.name as never, destination.params as never);
        }
      }, route?.params.time);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeArea>
      <LoadingComponent duration={route?.params?.time ? undefined : 0} />
      <SponsorContainer>
        <LoadingAd visible={!!route?.params?.time} />
      </SponsorContainer>
    </SafeArea>
  );
};

export { AuthLoadingScreen };
