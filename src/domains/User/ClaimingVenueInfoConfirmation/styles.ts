import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    flex: 1;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const HeaderConteiner = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(18)}px;
    padding-bottom: ${theme.metrics.px(28)}px;
  `}
`;

export const Items = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(20)}px;
  `}
`;

export const ItemWrapper = styled.View``;

export const Item = styled.View`
  flex-direction: row;
`;

export const TitleWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(110)}px;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(80)}px;
  `}
`;
