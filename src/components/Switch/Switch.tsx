import { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '../Text/Text';
import { ClickText, Switch as Swit, SwitchContainer, YesNo } from './styles';


type SwitchProps = {
  initValue: boolean;
  label?: string;
  onValueChange?: (value: boolean) => void;
  inverted?: boolean;
  children?: ReactNode;
  showText?: boolean;
};

export const Switch = ({
  initValue,
  label,
  inverted = false,
  children,
  showText = true,
  ...props
}: SwitchProps) => {
  const click = () => {
    // @ts-ignore
    props.onValueChange(!initValue);
  };

  return (
  <SwitchContainer alignTop={!!children}>
    {label && inverted ? (
      <Text size={11} mh={8} bold color="neutral300">
        {label}
      </Text>
    ) : null}
    <View>
      <Swit
        value={initValue}
        {...props}
      />
      {showText && (
        <ClickText onPress={click}>
          <YesNo>{initValue ? 'ON' : ''}</YesNo>
          <YesNo>{!initValue ? 'OFF' : ''}</YesNo>
        </ClickText>
      )}
    </View>
    {label && !inverted ? (
      <Text mh={8} size={14}>
        {label}
      </Text>
    ) : null}
    {children}
  </SwitchContainer>
  )
};