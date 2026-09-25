import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    justify-content: space-between;
    padding-top: ${theme.metrics.px(30)}px;
  `}
`;

export const ButtonsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-vertical: ${theme.metrics.px(16)}px;
    gap: ${theme.metrics.px(8)}px;
  `}
`;
