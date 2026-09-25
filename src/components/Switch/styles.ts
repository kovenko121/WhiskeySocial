import { theme as gTheme } from '@theme';
import { Switch as Swit } from 'react-native';
import styled, { css, DefaultTheme } from 'styled-components/native';
import { Text } from '../Text/Text';

type SwitchProps = {
  theme: DefaultTheme;
  alignTop?: boolean;
};

export const SwitchContainer = styled.View`
  ${({ theme, alignTop = false }: SwitchProps) => css`
    flex-direction: row;
    align-items: ${alignTop ? 'flex-start' : 'center'};
    margin-vertical: ${theme.metrics.px(8)}px;
    min-height: ${theme.metrics.px(32)}px;
    max-width: 100%;
  `};
`;

export const Switch = styled(Swit).attrs(() => ({
  onColor: gTheme.colors.primary,
  offColor: gTheme.colors.grey400,
  height: gTheme.metrics.px(28),
  width: gTheme.metrics.px(68),
  thumbSize: gTheme.metrics.px(24),
  thumbStyle: {
    backgroundColor: gTheme.colors.white,
    borderRadius: 50,
    height: gTheme.metrics.px(24),
  },
}))`
  border-radius: 50px;
`;

export const ClickText = styled.TouchableOpacity`
  ${({ theme }: SwitchProps) => css`
    position: absolute;
    width: 100%;
    height: 100%;
    flex-direction: row;
    justify-content: space-between;
    padding-horizontal: ${theme.metrics.px(8)}px;
  `};
`;

export const YesNo = styled(Text)`
  ${({ theme }: SwitchProps) => css`
    color: ${theme.colors.white};
    font-family: ${theme.fonts.semibold};
    font-size: ${theme.metrics.px(11)}px;
    padding-top: ${theme.metrics.px(6)}px;
    flex: 1;
  `};
`;
