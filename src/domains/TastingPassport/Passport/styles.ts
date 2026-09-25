import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const Scroll = styled.ScrollView`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    width: 100%;
    /* Fixed gap below the header so scrolling content clips a little under it, never flush against
       it. A margin (not scroll padding) keeps the gap in place as the list moves. */
    margin-top: ${theme.metrics.px(12)}px;
  `}
`;

export const Body = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-bottom: ${theme.metrics.px(40)}px;
  `}
`;

export const Grid = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    flex-wrap: wrap;
    row-gap: ${theme.metrics.px(20)}px;
    column-gap: ${theme.metrics.px(8)}px;
    margin-top: ${theme.metrics.px(6)}px;
  `}
`;

export const CompleteBanner = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(24)}px;
    padding: ${theme.metrics.px(16)}px;
    border-radius: ${theme.metrics.px(12)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.primary500};
    align-items: center;
  `}
`;

export const CompleteText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(18)}px;
    color: ${theme.colors.warning};
  `}
`;

export const LoadingWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
