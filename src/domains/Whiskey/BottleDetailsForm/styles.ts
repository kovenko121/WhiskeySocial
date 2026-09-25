import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-top: ${theme.metrics.px(20)}px;
    min-height: ${theme.metrics.px(600)}px;
  `}
`;

export const BottomButtonWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-top: ${theme.metrics.px(8)}px;
    height: ${theme.metrics.px(120)}px;
  `}
`;

export const HeaderWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(8)}px;
  `}
`;

