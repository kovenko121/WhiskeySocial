import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: 100%;
    width: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    margin-top: ${theme.metrics.px(18)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const SearchContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    margin-vertical: ${theme.metrics.px(16)}px;
    min-height: ${theme.metrics.px(60)}px;
  `}
`;

export const ListContainer = styled.View`
  flex: 1;
  width: 100%;
`;
