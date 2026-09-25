import { getTestId } from '@helpers';
import { Icons as IconsNames } from '@types';
import { useEffect, useRef } from 'react';
import { Keyboard, TextInputProps, TouchableOpacity } from 'react-native';
import {
  Controller,
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form';
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

type InputProps<T extends FieldValues> = UseControllerProps<T> &
  TextInputProps & {
    placeholder?: string;
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

const ControlledInput = <T extends FieldValues>({
  secureTextEntry = false,
  mv,
  mh,
  icon,
  iconRight,
  size,
  round,
  large,
  label,
  numberOfLines,
  counter,
  labelSize = 13,
  iconSize = 32,
  iconColor,
  onPressIcon,
  mask,
  keyboardType,
  color = 'black700',
  multiline = false,
  startedWithFocus = false,
  countrySelect = false,
  countryValue,
  control,
  name,
  rules,
  defaultValue,
  ...props
}: InputProps<T>) => {
  const inputRef = useRef<HTMLInputElement>();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController<T>({
    name,
    control,
    rules,
    defaultValue,
  });

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

  //  on mount the value if it is undefined or empty string, we set it to null
  useEffect(() => {
    if (value === undefined || value === '') {
      onChange(null);
    }
  });

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
        <Controller
          control={control}
          rules={rules}
          render={() => (
            // BaseInput is actually a MaskInput from a third-party library. I don't know why they used a mask atm
            <BaseInput
              value={value}
              ref={inputRef}
              keyboardType={keyboardType || 'default'}
              autoCapitalize="sentences"
              returnKeyType="done"
              secureTextEntry={secureTextEntry}
              placeholderTextColor={theme.colors.black300}
              editable
              bold={large as boolean}
              numberOfLines={numberOfLines}
              multiline={multiline || (numberOfLines as number) > 1}
              onKeyPress={(event: { nativeEvent: { key: string } }) => {
                if (event.nativeEvent.key === 'Enter') {
                  Keyboard.dismiss();
                }
              }}
              onChangeText={(_masked: string, unmasked: string) => {
                onChange(unmasked);
              }}
              mask={mask}
              color={color}
              countrySelect={countrySelect}
              {...props}
            />
          )}
          name={name}
        />
        {iconRight ? (
          <IconContainer>
            <TouchableOpacity onPress={onPressIcon}>
              <Icon name={iconRight} color="neutral300" size={iconSize} />
            </TouchableOpacity>
          </IconContainer>
        ) : null}
      </InputContainer>

      {error?.message && (
        <Text mv={4} mh={8} color="red" align={counter ? 'left' : 'center'}>
          {error.message}
        </Text>
      )}
      {counter && <Counter>{counter} Characters left</Counter>}
    </InputWrapper>
  );
};

export { ControlledInput };
