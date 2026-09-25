import { Header, SectionSubTitle, SubTitle, Text } from '@components';
import { useGetUser, useUpdatePrivacySetting } from '@hooks';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import {
  ContentContainer,
  InfoContainer,
  OptionContainer,
  OptionTextContainer,
  RadioCircleInner,
  RadioCircleOuter,
  ScreenContainer,
  SectionContainer,
} from './styles';

const PRIVACY_OPTIONS = [
  {
    value: 'EVERYONE',
    label: 'Everyone',
    description: 'Anyone on Whiskey Social can send you a\nmessage request',
  },
  {
    value: 'FOLLOWING',
    label: 'People I Follow',
    description: 'Only people you follow can message you\ndirectly',
  },
  {
    value: 'NONE',
    label: 'No One',
    description: 'Turn off direct messages from everyone',
  },
];

export const PrivacySettingsScreen = () => {
  const { data } = useGetUser();
  const { mutate, isPending } = useUpdatePrivacySetting();
  const currentSetting = (data as any)?.dmPrivacySetting as string | undefined;
  const [selected, setSelected] = useState<string>(
    currentSetting ?? 'EVERYONE'
  );
  const [savingOption, setSavingOption] = useState<string | null>(null);

  useEffect(() => {
    if (currentSetting) setSelected(currentSetting);
  }, [currentSetting]);

  const onSelect = (value: string) => {
    if (value === selected || isPending) return;

    const previousValue = selected;
    setSelected(value);
    setSavingOption(value);

    mutate(
      { dmPrivacySetting: value },
      {
        onSuccess: () => {
          setSavingOption(null);
        },
        onError: () => {
          setSelected(previousValue);
          setSavingOption(null);
        },
      }
    );
  };

  return (
    <ScreenContainer>
      <Header title="Privacy" />

      <ContentContainer showsVerticalScrollIndicator={false}>
        <SubTitle size={16} align="left" mt={0} bold>
          Direct Messages
        </SubTitle>

        <SectionContainer>
          <SectionSubTitle size={14} align="left" mt={0} bold>
            Who can message me
          </SectionSubTitle>

          {PRIVACY_OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            const isSaving = savingOption === option.value;

            return (
              <OptionContainer
                key={option.value}
                selected={isSelected}
                onPress={() => onSelect(option.value)}
                activeOpacity={0.7}
              >
                <RadioCircleOuter>
                  {isSelected && <RadioCircleInner />}
                </RadioCircleOuter>

                <OptionTextContainer>
                  <SectionSubTitle size={14} align="left" mt={0} bold>
                    {option.label}
                  </SectionSubTitle>
                  <Text size={11} color="neutral300">
                    {option.description}
                  </Text>
                </OptionTextContainer>

                {isSaving && <ActivityIndicator size="small" />}
              </OptionContainer>
            );
          })}
        </SectionContainer>

        <InfoContainer>
          <Text size={11} color="neutral300">
            This won't affect your existing conversations.
          </Text>
        </InfoContainer>
      </ContentContainer>
    </ScreenContainer>
  );
};
