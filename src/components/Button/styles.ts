import { theme } from '@theme';
import styled, { css, DefaultTheme } from 'styled-components/native';
import { BaseText } from '../Text/Text';

export type ButtonVariants =
  | 'default'
  | 'outlineDefault'
  | 'outlineRed'
  | 'disabled'
  | 'textOnly'
  | 'red'
  | 'outlineRedTextWhite'
  | 'textOnlyPrimary';

type ButtonContainerProps = {
  theme: DefaultTheme;
  color?: keyof DefaultTheme['colors'];
  mv?: number;
  mh?: number;
  variant?: ButtonVariants;
  full?: boolean;
  disabled?: boolean;
  small?: boolean;
  center?: boolean;
  ph?: number;
};

type ButtonVariant = {
  background: string;
  color: string;
  borderColor: string;
};

const variants: Record<string, ButtonVariant> = {
  default: {
    background: theme.colors.primary600,
    color: theme.colors.white,
    borderColor: theme.colors.primary600,
  },
  disabled: {
    background: theme.colors.grey300,
    color: theme.colors.white,
    borderColor: theme.colors.grey300,
  },
  outlineDefault: {
    background: theme.colors.transparent,
    color: theme.colors.white,
    borderColor: theme.colors.primary500,
  },
  outlineRed: {
    background: theme.colors.transparent,
    color: theme.colors.red,
    borderColor: theme.colors.red,
  },
  textOnly: {
    background: theme.colors.transparent,
    color: theme.colors.white,
    borderColor: theme.colors.transparent,
  },
  red: {
    background: theme.colors.red,
    color: theme.colors.white,
    borderColor: theme.colors.red,
  },
  textOnlyPrimary: {
    background: theme.colors.transparent,
    color: theme.colors.primary500,
    borderColor: theme.colors.transparent,
  },
  outlineRedTextWhite: {
    background: theme.colors.transparent,
    color: theme.colors.white,
    borderColor: theme.colors.red,
  },
};

const disableOrVariant = (disabled: boolean, value: string) => {
  let variant = value;
  if (disabled) {
    variant = 'disabled';
  }

  return variants[variant] as ButtonVariant;
};

export const ButtonContainer = styled.TouchableOpacity`
  ${({
    mv,
    mh,
    variant = 'default',
    full = false,
    disabled = false,
    small = false,
    center = true,
    ph = 30,
  }: ButtonContainerProps) => css`
    flex-direction: row;
    align-items: center;
    justify-content: ${center ? 'center' : 'flex-start'};
    background-color: ${disableOrVariant(disabled, variant).background};
    min-height: ${theme.metrics.px(small ? 26 : 40)}px;
    max-height: ${theme.metrics.px(40)}px;
    margin-vertical: ${theme.metrics.px(mv || 0)}px;
    margin-horizontal: ${theme.metrics.px(mh || 0)}px;
    padding-horizontal: ${theme.metrics.px(small ? 6 : ph)}px;
    width: ${full ? '100%' : 'auto'};
    border-color: ${disableOrVariant(disabled, variant).borderColor};
    border-width: 1px;
    border-radius: ${theme.metrics.px(37)}px;
  `}
`;

export const ButtonText = styled(BaseText)`
  ${({
    variant = 'default',
    small = false,
  }: {
    theme: DefaultTheme;
    variant: ButtonVariants;
    small?: boolean;
  }) => css`
    font-size: ${theme.metrics.px(small ? 12 : 14)}px;
    color: ${variants[variant].color};
    font-family: ${theme.fonts.semibold};
  `}
`;

export const IconContainer = styled.View`
  ${({ iconSpacing }: { iconSpacing: boolean }) => css`
    margin-right: ${iconSpacing ? theme.metrics.px(15) : 0}px;
  `}
`;
