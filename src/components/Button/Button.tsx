import { getTestId } from '@helpers';
import { Icons } from '@types';
import { ActivityIndicator } from 'react-native';
import { DefaultTheme } from 'styled-components/native';
import { Icon } from '../Icon/Icon';
import {
  ButtonContainer,
  ButtonText,
  ButtonVariants,
  IconContainer,
} from './styles';

type ButtonProps = {
  label: string;
  onPress?: () => any;
  mv?: number;
  mh?: number;
  icon?: Icons;
  variant?: ButtonVariants;
  full?: boolean;
  disabled?: boolean;
  loading?: boolean;
  iconSize?: number;
  small?: boolean;
  center?: boolean;
  iconColor?: keyof DefaultTheme['colors'];
  ph?: number;
  iconSpacing?: boolean;
  testID?: string;
};

const noop = () => {};

const Button = ({
  label,
  onPress,
  icon,
  iconSize = 16,
  iconSpacing = true,
  variant = 'default',
  disabled = false,
  loading = false,
  small = false,
  iconColor = 'white',
  testID,
  ...props
}: ButtonProps) => (
  <ButtonContainer
    onPress={disabled || loading ? noop : onPress}
    variant={variant}
    disabled={disabled}
    small={small}
    testID={getTestId(testID ?? label)}
    {...props}
  >
    {loading ? (
      <IconContainer iconSpacing={false}>
        <ActivityIndicator color="white" />
      </IconContainer>
    ) : (
      icon && (
        <IconContainer iconSpacing={iconSpacing}>
          <Icon name={icon} size={iconSize} color={iconColor} />
        </IconContainer>
      )
    )}
    <ButtonText small={small} variant={variant}>
      {loading ? '' : label}
    </ButtonText>
  </ButtonContainer>
);

export { Button };
