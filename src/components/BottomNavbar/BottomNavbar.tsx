import { useNavigation } from '@react-navigation/native';
import type { Icons, NavigationProps } from '@types';
import { UserType } from '@types';
import { useAuth } from '@contexts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAndroid } from '@helpers';
import { useGetUser } from '../../hooks/user/useGetUser';
import { Icon } from '../Icon/Icon';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { ActiveBar, Container, IconContainer, Text } from './styles';

type NavbarProps = {
  active: 'search' | 'home' | 'my-collection' | 'profile';
  onActivePress?: () => void;
};

const BottomNavbar = ({ active, onActivePress }: NavbarProps) => {
  const navigation = useNavigation<NavigationProps>();
  const { isGuest } = useAuth();
  const { data: myUser } = useGetUser();

  const insets = useSafeAreaInsets();

  const resolveBottomPadding = () => {
    if (!isAndroid) return insets.bottom; // iOS real inset
    return insets.bottom > 0 ? insets.bottom : 25; // Android fallback
  };

  const bottomPadding = resolveBottomPadding();

  const buttons = [
    {
      name: 'search',
      icon: 'search',
      label: 'Discover',
      labelForVenue: 'Discover',
      screen: 'Discover',
    },
    // The Activity feed requires an account, so it's hidden for guests.
    ...(isGuest
      ? []
      : [
          {
            name: 'home',
            icon: 'home',
            label: 'Activity',
            labelForVenue: 'Activity',
            screen: 'Home',
          },
          // My Collection requires an account, so it's hidden for guests.
          {
            name: 'my-collection',
            icon: 'table',
            label: 'My Collection',
            labelForVenue: 'Profile',
            screen: 'MyCollection',
          },
        ]),
  ];

  const goToScreen = (screen: string, name: string): void => {
    navigation.navigate(screen as never);
    if (name === active && onActivePress) {
      onActivePress();
    }
  };

  return (
    <Container style={{ paddingBottom: bottomPadding }}>
      {buttons.map((button) => (
        <IconContainer
          key={button.name}
          testID={button.name}
          onPress={() => goToScreen(button.screen, button.name)}
        >
          {active === button.name && <ActiveBar />}

          {button.name === 'my-collection' &&
          myUser?.userType === UserType.VENUE ? (
            <ProfilePicture
              onPress={() => goToScreen(button.screen, button.name)}
              size="xx-small"
              border
              borderColor={active === 'my-collection' ? 'primary' : 'grey400'}
              image={myUser?.profilePictureLoaded}
            />
          ) : (
            <Icon
              name={button.icon as Icons}
              size={26}
              color={active === button.name ? 'primary' : 'grey400'}
            />
          )}
          <Text active={active === button.name}>
            {myUser?.userType === UserType.VENUE
              ? button.labelForVenue
              : button.label}
          </Text>
        </IconContainer>
      ))}
    </Container>
  );
};

export { BottomNavbar };
