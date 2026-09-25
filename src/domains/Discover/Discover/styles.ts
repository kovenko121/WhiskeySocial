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
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const AdContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const SearchButton = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(8)}px;
    background-color: ${theme.colors.white};
    min-height: ${theme.metrics.px(50)}px;
    max-height: ${theme.metrics.px(50)}px;
    padding-horizontal: ${theme.metrics.px(14)}px;
    margin-horizontal: ${theme.metrics.px(24)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.primary500};
    border-radius: ${theme.metrics.px(50)}px;
    margin-bottom: ${theme.metrics.px(24)}px;
  `}
`;

export const ButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(8)}px;
    margin-vertical: ${theme.metrics.px(8)}px;
  `}
`;

export const Content = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(20)}px;
    padding-bottom: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentItem = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(16)}px;
  `}
`;

export const ScrollContainer = styled.ScrollView`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    /* Fixed gap below the header, matching the Tasting Passport screen. */
    margin-top: ${theme.metrics.px(12)}px;
  `}
`;
