import { Button, CardButton, Divider, Header, Text } from '@components';
import { contactSupport } from '@helpers';
import { useAuth } from '@contexts';
import { useVersion } from '@hooks';
import { FlatList } from 'react-native';
import { Icons, Routes } from '@types';
import {
  Bottom,
  ContentContainer,
  PositionContainer,
  ScreenContainer,
} from './styles';

const SettingsScreen = ({ navigation }: any) => {
  const { signOut } = useAuth();
  const { version } = useVersion();

  const goToNotificationSettingsScreen = async () => {
    navigation.navigate(Routes.NotificationsSettings);
  };
  const goToAccountSettingsScreen = async () => {
    navigation.navigate(Routes.AccountSettings);
  };
  const goToPrivacySettingsScreen = async () => {
    navigation.navigate(Routes.PrivacySettings);
  };
  // const goToSecuritySettingsScreen = async () => {
  //   navigation.navigate(Routes.SecuritySettings);
  // };

  const data: {
    icon: Icons;
    title: string;
    content: string;
    onPress: () => void;
    mv: number;
  }[] = [
    {
      icon: 'lock',
      title: 'Account',
      content: 'Change your e-mail',
      onPress: () => goToAccountSettingsScreen(),
      mv: 8,
    },
    // {
    //   icon: 'lock',
    //   title: 'Security',
    //   content:
    //     'Change your privacy options, set two-factor authentication, etc',
    //   onPress: () => goToSecuritySettingsScreen(),
    //   mv: 8,
    // },
    {
      icon: 'lock',
      title: 'Privacy',
      content: 'Control who can send you direct messages',
      onPress: () => goToPrivacySettingsScreen(),
      mv: 8,
    },
    {
      icon: 'ring',
      title: 'Notifications',
      content:
        'Change how the app communicates with you, set push notifications, etc.',
      onPress: () => goToNotificationSettingsScreen(),
      mv: 8,
    },
    {
      icon: 'mail',
      title: 'Contact Support',
      content: "Questions or trouble? We'll help.",
      onPress: () => contactSupport('settings'),
      mv: 8,
    },
  ];

  return (
    <ScreenContainer>
      <Header title="Settings" />
      <ContentContainer>
        <PositionContainer mb={30} />
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <CardButton
              icon={item.icon}
              title={item.title}
              content={item.content}
              onPress={item.onPress}
              mv={item.mv}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </ContentContainer>
      <Bottom>
        <Divider />
        <Button
          mh={4}
          label="Logout"
          icon="exit"
          iconSize={20}
          center={false}
          iconColor="primary500"
          variant="textOnlyPrimary"
          ph={0}
          onPress={signOut}
        />
        <Text style={{ textAlign: 'right' }}>Version: {version}</Text>
      </Bottom>
    </ScreenContainer>
  );
};
export { SettingsScreen };
