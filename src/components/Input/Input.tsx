import { getTestId } from '@helpers';
import { Icons as IconsNames } from '@types';
import { useEffect, useRef } from 'react';
import { TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';
import { CountrySelect } from '../CountrySelect/CountrySelect';
import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';
import {
  BaseInput,
  Counter,
  IconContainer,
  InputContainer,
  InputWrapper,
  Label,
} from './styles';

type InputProps = TextInputProps & {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  mv?: number;
  mh?: number;
  icon?: IconsNames;
  iconRight?: IconsNames;
  iconColor?: string;
  label?: string;
  labelSize?: number;
  size?: number | string;
  round?: boolean;
  error?: boolean;
  errorMessage?: string;
  large?: boolean;
  numberOfLines?: number;
  counter?: string;
  iconSize?: number;
  mask?: any;
  color?: string;
  onPressIcon?: () => void;
  multiline?: boolean;
  startedWithFocus?: boolean;
  countrySelect?: boolean;
  countryValue?: string;
  onCountryChange?: (text: string) => void;
};

const Input = ({
  secureTextEntry = false,
  mv,
  mh,
  icon,
  iconRight,
  size,
  round,
  error,
  large,
  errorMessage,
  label,
  numberOfLines,
  counter,
  labelSize = 13,
  iconSize = 32,
  iconColor,
  onPressIcon,
  onChangeText,
  mask,
  keyboardType,
  color = 'black700',
  multiline = false,
  startedWithFocus = false,
  countrySelect = false,
  countryValue,
  ...props
}: InputProps) => {
  const inputRef = useRef<TextInput>(null);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (startedWithFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [startedWithFocus, inputRef]);

  return (
    <InputWrapper numberOfLines={numberOfLines} mv={mv} mh={mh}>
      {label && (
        <Label mv={8} color="black700" align="left" size={labelSize} bold>
          {label}
        </Label>
      )}
      <InputContainer
        size={size as number}
        round={round}
        error={error}
        large={large}
        numberOfLines={numberOfLines}
        countrySelect={countrySelect}
        onPress={handleClick}
        testID={getTestId(props.placeholder || label || 'input')}
      >
        {countrySelect && (
          <CountrySelect
            onChange={props.onCountryChange!}
            initialValue={countryValue}
          />
        )}
        {icon && (
          <IconContainer>
            <Icon
              name={icon}
              color={iconColor || 'neutral300'}
              size={iconSize}
            />
          </IconContainer>
        )}
        <BaseInput
          ref={inputRef}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="sentences"
          returnKeyType={props.returnKeyType || 'done'}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={theme.colors.black300}
          editable
          bold={large as boolean}
          numberOfLines={numberOfLines}
          multiline={multiline || (numberOfLines as number) > 1}
          // Below is code that will cause the keyboard to dismiss when the user presses enter
          // If you need this functionality. Simply pass the prop `onKeyPress` to the Input component. Where you need it, it should not be implemented here.
          // onKeyPress={(event) => {
          //   if (event.nativeEvent.key === 'Enter') {
          //     Keyboard.dismiss();
          //   }
          // }}
          onChangeText={(_: string, unmasked: string) => {
            if (onChangeText) {
              onChangeText(unmasked);
            }
          }}
          mask={mask}
          color={color}
          countrySelect={countrySelect}
          {...props}
        />
        {iconRight ? (
          <IconContainer>
            <TouchableOpacity onPress={onPressIcon}>
              <Icon name={iconRight} color="neutral300" size={iconSize} />
            </TouchableOpacity>
          </IconContainer>
        ) : null}
      </InputContainer>

      {errorMessage && (
        <Text mv={4} mh={8} color="red" align={counter ? 'left' : 'center'}>
          {errorMessage}
        </Text>
      )}
      {counter && <Counter>{counter} Characters left</Counter>}
    </InputWrapper>
  );
};

export { Input };
