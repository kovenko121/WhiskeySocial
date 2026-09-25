import MaskInput from 'react-native-mask-input';
import styled, { css, DefaultTheme } from 'styled-components/native';
import { Text, Title } from '../Text/Text';

type InputContainerProps = {
  theme: DefaultTheme;
  size?: number;
  round?: boolean;
  error?: boolean;
  large?: boolean;
  numberOfLines?: number;
  countrySelect?: boolean;
};

export const InputContainer = styled.Pressable`
  ${({
    theme,
    size,
    round = false,
    error = false,
    numberOfLines = 1,
    countrySelect = false,
  }: InputContainerProps) => css`
    flex-direction: row;
    align-items: ${countrySelect ? 'center' : 'flex-start'};
    background-color: ${theme.colors.white};
    width: ${size || '100%'};
    min-height: ${theme.metrics.px(numberOfLines * 50)}px;
    max-height: ${theme.metrics.px(numberOfLines * 50)}px;
    flex: 1;
    padding: ${theme.metrics.px(countrySelect ? 0 : 8)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${error ? theme.colors.red : theme.colors.primary500};
    border-radius: ${theme.metrics.px(round ? 50 : 8)}px;
  `}
`;

export const IconContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(8)}px;
    padding-top: ${theme.metrics.px(6)}px;
  `}
`;

export const BaseInput = styled(MaskInput).attrs({
  allowFontScaling: false,
})`
  ${({
    theme,
    editable = true,
    bold = false,
    color = 'black',
    countrySelect = false,
    numberOfLines = 1,
  }: {
    theme: DefaultTheme;
    editable: boolean;
    bold: boolean;
    color: keyof DefaultTheme['colors'];
    countrySelect: boolean;
    numberOfLines?: number;
  }) => css`
    flex: 1;
    text-align: left;
    text-align-vertical: top;
    font-family: ${bold ? theme.fonts.bold : theme.fonts.regular};
    font-size: ${theme.metrics.px(14)}px;
    color: ${editable ? theme.colors[color] : theme.colors.grey200};
    padding-left: 5px;
    padding-top: ${countrySelect ? theme.metrics.px(0) : theme.metrics.px(7)}px;
    ${numberOfLines > 1 &&
    css`
      height: 100%;
    `}
  `}
`;

export const InputWrapper = styled.View`
  ${({
    theme,
    mv,
    mh,
    numberOfLines = 1,
  }: {
    theme: DefaultTheme;
    mv?: number;
    mh?: number;
    numberOfLines: number;
  }) => css`
    min-height: ${theme.metrics.px(numberOfLines * 50 + 2)}px;
    margin-vertical: ${theme.metrics.px(mv || 0)}px;
    margin-horizontal: ${theme.metrics.px(mh || 0)}px;
    flex: 1;
  `}
`;

export const Label = styled(Title)`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(18)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
    color: ${theme.colors.white};
    line-height: ${theme.metrics.px(22)}px;
  `}
`;

export const Counter = styled(Text)`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: absolute;
    bottom: -20px;
    right: 0;
    align-self: flex-end;
    color: ${theme.colors.white};
  `}
`;
