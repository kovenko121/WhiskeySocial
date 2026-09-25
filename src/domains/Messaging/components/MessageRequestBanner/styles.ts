import styled, { css, DefaultTheme } from 'styled-components/native';

export const BannerContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(16)}px;
    padding-vertical: ${theme.metrics.px(14)}px;
    background-color: ${theme.colors.grey400};
    border-bottom-width: ${theme.metrics.px(1)}px;
    border-bottom-color: ${theme.colors.grey300};
  `}
`;

export const InfoText = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(12)}px;
  `}
`;

export const ButtonRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(10)}px;
  `}
`;

export const AcceptButton = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.primary500};
    border-radius: ${theme.metrics.px(8)}px;
    padding-vertical: ${theme.metrics.px(8)}px;
    padding-horizontal: ${theme.metrics.px(20)}px;
  `}
`;

export const DeclineButton = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.grey300};
    border-radius: ${theme.metrics.px(8)}px;
    padding-vertical: ${theme.metrics.px(8)}px;
    padding-horizontal: ${theme.metrics.px(20)}px;
  `}
`;

export const BlockButton = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-vertical: ${theme.metrics.px(8)}px;
    padding-horizontal: ${theme.metrics.px(12)}px;
  `}
`;
