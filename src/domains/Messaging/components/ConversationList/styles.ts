import styled, { css, DefaultTheme } from 'styled-components/native';

export const EmptyContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(24)}px;
    margin-top: ${theme.metrics.px(80)}px;
  `}
`;

export const ErrorContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(24)}px;
    margin-top: ${theme.metrics.px(80)}px;
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
