import styled, { css, DefaultTheme } from 'styled-components/native';

export const Banner = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(12)}px;
    padding-vertical: ${theme.metrics.px(10)}px;
    padding-horizontal: ${theme.metrics.px(14)}px;
    border-radius: ${theme.metrics.px(10)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.grey400};
  `}
`;

export const Message = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(13)}px;
    line-height: ${theme.metrics.px(18)}px;
    color: ${theme.colors.grey100};
  `}
`;
