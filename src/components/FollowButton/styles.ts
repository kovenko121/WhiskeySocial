import styled, { css, DefaultTheme } from 'styled-components/native';

export const UnfollowButton = styled.View`
  ${({
    theme
  }: { theme: DefaultTheme }) => css`
    align-items: center;
    justify-content: center;
    background-color: ${theme.colors.primary};
    height: ${theme.metrics.px(26)}px;
    min-width: ${theme.metrics.px(65)}px;
    border-width: 1px;
    border-radius: ${theme.metrics.px(37)}px;
    padding-horizontal: ${theme.metrics.px(10)}px;
    border-color: ${theme.colors.primary600};
  `}
`;
