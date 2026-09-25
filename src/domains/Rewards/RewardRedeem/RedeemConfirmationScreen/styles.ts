import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    display: flex;
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    margin-top: ${theme.metrics.px(18)}px;
    padding-horizontal: ${theme.metrics.px(16)}px;
    margin-bottom: ${theme.metrics.px(44)}px;
    justify-content: space-between;
  `}
`;

export const TitleSubtitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    width: 100%;
    margin-top: ${theme.metrics.px(36)}px;
    margin-bottom: ${theme.metrics.px(40)}px;
  `}
`;

