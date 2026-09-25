import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const HeaderContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(12)}px;
    padding-vertical: ${theme.metrics.px(10)}px;
    border-bottom-width: ${theme.metrics.px(1)}px;
    border-bottom-color: ${theme.colors.grey400};
  `}
`;

export const BackButton = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding: ${theme.metrics.px(8)}px;
  `}
`;

export const HeaderUserInfo = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    flex-direction: row;
    align-items: center;
    margin-left: ${theme.metrics.px(4)}px;
    gap: ${theme.metrics.px(10)}px;
  `}
`;

export const SettingsButton = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding: ${theme.metrics.px(8)}px;
  `}
`;

export const EmptyStateContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ErrorContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const RetryButton = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(12)}px;
    padding-vertical: ${theme.metrics.px(8)}px;
    padding-horizontal: ${theme.metrics.px(20)}px;
    background-color: ${theme.colors.primary500};
    border-radius: ${theme.metrics.px(8)}px;
  `}
`;