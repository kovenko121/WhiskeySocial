import { theme } from '@theme';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const IconWrapper = styled.View`
  ${() => css`
    justify-content: center;
    align-items: center;
    padding-vertical: ${theme.metrics.px(30)}px;
    padding-horizontal: ${theme.metrics.px(20)}px;
  `}
`;

export const TextWrapper = styled.View`
  ${() => css`
    flex: 1;
    padding-left: ${theme.metrics.px(8)}px;
    padding-right: ${theme.metrics.px(20)}px;
    padding-vertical: ${theme.metrics.px(10)}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `}
`;

export type ButtonVariants = 'active' | 'inactive' | 'disabled';

type ButtonVariant = {
  background: string;
  color: string;
  borderColor: string;
};

const variants: Record<string, ButtonVariant> = {
  active: {
    background: theme.colors.transparent,
    color: theme.colors.white,
    borderColor: theme.colors.primary600,
  },
  inactive: {
    background: theme.colors.transparent,
    color: theme.colors.white,
    borderColor: theme.colors.grey300,
  },
  disabled: {
    background: theme.colors.grey300,
    color: theme.colors.white,
    borderColor: theme.colors.grey300,
  },
  white: {
    background: theme.colors.transparent,
    color: theme.colors.white,
    borderColor: theme.colors.white,
  },
};

const disableOrVariant = (
  disabled: boolean,
  value: string,
  variant: string
) => {
  let state = value;
  if (disabled) {
    state = 'disabled';
  }
  if (variant === 'white') {
    state = 'white';
  }

  return variants[state] as ButtonVariant;
};

export const CardButtonContainer = styled.TouchableOpacity`
  ${({
    active = false,
    mv = 0,
    disabled = false,
    variant = '',
  }: {
    theme: DefaultTheme;
    active?: boolean;
    mv?: number;
    disabled?: boolean;
    variant?: string;
  }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 2px solid
      ${disableOrVariant(disabled, active ? 'active' : 'inactive', variant)
        .borderColor};
    border-radius: ${theme.metrics.px(16)}px;
    margin-vertical: ${theme.metrics.px(mv)}px;
    background-color: ${disableOrVariant(
      disabled,
      active ? 'active' : 'inactive',
      variant
    ).background};
  `}
`;

export const ProfilePictureContainer = styled.TouchableOpacity`
  ${() => css`
    margin-left: ${theme.metrics.px(20)}px;
    margin-vertical: ${theme.metrics.px(20)}px;
  `}
`;
