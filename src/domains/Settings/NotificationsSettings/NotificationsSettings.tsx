import {
  Button,
  Divider,
  Header,
  SectionSubTitle,
  SubTitle,
  Switch,
  Text,
} from '@components';
import { useGetUser, useUpdateNotificationSettings } from '@hooks';
import { NavigationProps, SettingsInput,
  Routes
} from '@types';
import { useEffect, useState } from 'react';
import { View , Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import {
  ButtonContainer,
  ContentContainer,
  GeneralContainer,
  Label,
  NotificationContainer,
  ScreenContainer,
} from './styles';


const messagingSettingNames = ['direct_messages', 'message_requests'];

const fieldTitle: Record<string, string> = {
  friends: 'Discovery',
  activities: 'New Activities',
  clubs: 'Clubs',
  direct_messages: 'Direct Messages',
  message_requests: 'Message Requests',
};

const defaultSettings: SettingsInput[] = [
  {
    name: 'clubs',
    description: 'Allows you to receive notifications for club activity and updates.',
    value: 'true',
  },
  {
    name: 'direct_messages',
    description: 'Notifications for messages in your conversations.',
    value: 'true',
  },
  {
    name: 'message_requests',
    description: 'Notifications when someone new wants to message you.',
    value: 'true',
  },
];

const ensureDefaultSettings = (settings: SettingsInput[]): SettingsInput[] => {
  if (!settings) return defaultSettings;
  const result = [...settings];
  defaultSettings.forEach((def) => {
    if (!result.find((s) => s.name === def.name)) {
      result.push(def);
    }
  });
  return result;
};

export const NotificationsSettingsScreen = () => {
  const { data } = useGetUser();
  const navigation = useNavigation<NavigationProps>();
  const { mutate, isLoading } = useUpdateNotificationSettings();
  const [notificationSettings, setNotificationSettings] = useState<
    SettingsInput[]
  >(ensureDefaultSettings(data?.notificationSettings as SettingsInput[]));
  const [all, setAll] = useState(
    notificationSettings.filter((obj) => obj.value === 'true').length ===
      notificationSettings.length
  );

  useEffect(() => {
    setAll(
      notificationSettings.filter((obj) => obj.value === 'true').length ===
        notificationSettings.length
    );
  }, [notificationSettings]);

  const onSubmit = async () => {
  const hasPermission = await checkDeviceNotificationPermissions();
  const hasEnabledToggles = notificationSettings.some(s => s.value === 'true');

  const doMutateAndNavigate = () => {
    mutate(
      { notificationSettings },
      {
        onSuccess: () => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate(Routes.Settings);
          }
        },
      }
    );
  };

  if (hasEnabledToggles && !hasPermission) {
    Alert.alert(
      'Enable Notifications',
      'Push notifications are disabled at the device level. Please enable them in your settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings();
            doMutateAndNavigate();
          },
        },
      ]
    );
  } else {
    doMutateAndNavigate();
  }
};

  const setAllPushes = () => {
    setNotificationSettings(
      notificationSettings?.map((obj) => ({
        ...obj,
        value: all ? 'false' : 'true',
      }))
    );
    setAll(!all);
  };

  const toggleSwitch = (item: SettingsInput) => {
    setNotificationSettings(
      notificationSettings?.map((obj) => {
        if (obj.name === item.name) {
          return { ...obj, value: item.value === 'true' ? 'false' : 'true' };
        }
        return obj;
      })
    );
  };

  const checkDeviceNotificationPermissions = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

  return (
  <ScreenContainer>
    <Header title="Notifications" />

    <ContentContainer>
      <GeneralContainer>
        <Label>
          <SubTitle size={16} align="left" mt={0} bold>
            Push Notifications
          </SubTitle>
          <Text size={11} color="neutral300">
            Toggle all notifications
          </Text>
        </Label>

        <NotificationContainer>
          <Switch initValue={all} onValueChange={setAllPushes} inverted showText={false} />
        </NotificationContainer>
      </GeneralContainer>

      <SubTitle size={16} align="left" mt={22} bold>
        Specific Notifications
      </SubTitle>
      <Text size={11} color="neutral300">
        Manage the notifications settings individually
        {'\n\n'}
      </Text>

      {notificationSettings
        .filter((item) => !messagingSettingNames.includes(item.name))
        .map((item, index, arr) => (
          <View key={item.name}>
            <GeneralContainer>
              <Label>
                <SectionSubTitle size={14} align="left" mt={0} bold>
                  {fieldTitle[item.name]}
                </SectionSubTitle>
                <Text size={11} color="neutral300">
                  {item.description}
                </Text>
              </Label>

              <NotificationContainer>
                <Switch
                  initValue={item.value === 'true'}
                  onValueChange={() => toggleSwitch(item)}
                  inverted
                  showText={false}
                />
              </NotificationContainer>
            </GeneralContainer>

            {index !== arr.length - 1 && <Divider />}
          </View>
        ))}

      <SubTitle size={16} align="left" mt={22} bold>
        Messages
      </SubTitle>
      <Text size={11} color="neutral300">
        Manage notifications for direct messages
        {'\n\n'}
      </Text>

      {notificationSettings
        .filter((item) => messagingSettingNames.includes(item.name))
        .map((item, index, arr) => (
          <View key={item.name}>
            <GeneralContainer>
              <Label>
                <SectionSubTitle size={14} align="left" mt={0} bold>
                  {fieldTitle[item.name]}
                </SectionSubTitle>
                <Text size={11} color="neutral300">
                  {item.description}
                </Text>
              </Label>

              <NotificationContainer>
                <Switch
                  initValue={item.value === 'true'}
                  onValueChange={() => toggleSwitch(item)}
                  inverted
                  showText={false}
                />
              </NotificationContainer>
            </GeneralContainer>

            {index !== arr.length - 1 && <Divider />}
          </View>
        ))}
    </ContentContainer>

    <ButtonContainer>
      <Button label="Save" onPress={onSubmit} loading={isLoading} />
    </ButtonContainer>
  </ScreenContainer>
);
};
