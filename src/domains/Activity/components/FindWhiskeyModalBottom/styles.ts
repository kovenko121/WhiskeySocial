import styled, { css, DefaultTheme } from 'styled-components/native';

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(22)}px;
    align-items: flex-start;
    width: 100%;
    height: 80%;
    gap: ${theme.metrics.px(16)}px;
  `}
`;

export const CenterContainer = styled.View`
  align-items: center;
  width: 100%;
`;

export const Loading = styled.ActivityIndicator.attrs(({ theme }: { theme: DefaultTheme }) => ({
  color: theme.colors.primary,
}))`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(4)}px;
  `}
`;

export const InputWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: ${theme.metrics.px(50)}px;
  `}
`;
