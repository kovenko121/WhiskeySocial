import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ContentContainer = styled.View`
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const SubtitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: column;
    margin-bottom: ${theme.metrics.px(20)}px;
    margin-top: ${theme.metrics.px(16)}px;
  `}
`;

export const BottomButtonWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-top: ${theme.metrics.px(0)}px;
    margin-bottom: ${theme.metrics.px(55)}px;
    padding-left: ${theme.metrics.px(16)}px;
    padding-right: ${theme.metrics.px(16)}px;
  `}
`;
