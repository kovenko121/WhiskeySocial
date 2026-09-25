import {
  Button,
  Divider,
  Header,
  Icon,
  SubTitle,
  Switch,
  Text,
} from '@components';
import { useGetUser, useUpdateSecuritySettings } from '@hooks';
import { SettingsInput } from '@types';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { RadioGroup } from './components';
import {
  ButtonContainer,
  ContentContainer,
  GeneralContainer,
  Label,
  PrivacyButton,
  Row,
  ScreenContainer,
  SwitchContainer,
  VerticalSpacer,
} from './styles';

export const SecuritySettingsScreen = () => {
  const { data } = useGetUser();

  const [securitySettings, setSecuritySettings] = useState<SettingsInput[]>(
    data?.securitySettings as SettingsInput[]
  );

  const [privacyVisible, setPrivacyVisible] = useState(false);

  const { mutate, isLoading } = useUpdateSecuritySettings('Settings');

  const options = [
    {
      label: 'Public',
      icon: 'earth',
    },
    {
      label: 'Friends Only',
      icon: 'user-heart',
    },
    {
      label: 'Only Me',
      icon: 'eye-off',
    },
  ];

  const fieldTitle = {
    seePosts: 'Who can see my posts?',
    commentPosts: 'Who can comment on my posts?',
    commentPhotos: 'Who can comment on my photos?',
    seeLocation: 'Who can see my location?',
  };

  const switchOption = (item: SettingsInput, label: string) => {
    setSecuritySettings(
      securitySettings?.map((obj) => {
        if (obj.name === item.name) {
          return { ...obj, value: label };
        }
        return obj;
      })
    );
  };

  const locationSwitch = () => {
    const filter = securitySettings?.filter(
      ({ name }) => name === 'seeLocation'
    )[0];
    if (!filter) return null;
    return (
      <RadioGroup
        title={fieldTitle[filter.name]}
        options={options}
        selectedOption={filter.value}
        onPress={(label) => switchOption(filter, label)}
      />
    );
  };

  const onSubmit = () => {
    mutate({
      securitySettings,
    });
  };

  return (
    <ScreenContainer>
      <Header title="Security" />

      <ContentContainer showsVerticalScrollIndicator={false}>
        <PrivacyButton onPress={() => setPrivacyVisible(!privacyVisible)}>
          <Row>
            <Label>
              <SubTitle size={18} align="left" mt={0} bold>
                Privacy
              </SubTitle>
            </Label>
            <Icon
              name={privacyVisible ? 'chevron-up' : 'chevron-down'}
              color="primary500"
              size={18}
            />
          </Row>

          <Text size={11} color="neutral300">
            Allows you to control who can see you post, comments, and photos.
          </Text>
        </PrivacyButton>

        {privacyVisible && (
          <FlatList
            data={securitySettings.filter(
              (item) => item.name !== 'location' && item.name !== 'seeLocation'
            )}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <RadioGroup
                title={fieldTitle[item.name]}
                options={options}
                selectedOption={item.value}
                onPress={(label) => switchOption(item, label)}
              />
            )}
          />
        )}

        <Divider />

        <GeneralContainer>
          <Row>
            <Label>
              <SubTitle size={18} align="left" mt={0} bold>
                Location
              </SubTitle>
            </Label>

            <SwitchContainer>
              <Switch
                initValue={
                  securitySettings?.filter(({ name }) => name === 'location')[0]
                    ?.value === 'true' || false
                }
                onValueChange={() =>
                  setSecuritySettings(
                    securitySettings?.map((obj) => {
                      if (obj.name === 'location') {
                        return {
                          ...obj,
                          value: obj.value === 'true' ? 'false' : 'true',
                        };
                      }
                      return obj;
                    })
                  )
                }
                inverted
              />
            </SwitchContainer>
          </Row>
          <Text size={11} color="neutral300">
            Allows you to receive notifications when a whiskey that you have
            been looking for becomes available in a nearby venue.
          </Text>
        </GeneralContainer>
        {securitySettings?.filter(({ name }) => name === 'location')[0]
          ?.value === 'true' && locationSwitch()}
        <VerticalSpacer />
      </ContentContainer>
      <ButtonContainer>
        <Button label="Save" onPress={onSubmit} loading={isLoading} />
      </ButtonContainer>
    </ScreenContainer>
  );
};
