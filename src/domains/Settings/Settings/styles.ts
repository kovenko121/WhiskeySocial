import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentContainer = styled.View`
    flex: 1;
`;

export const PositionContainer = styled.View`
  ${({
    theme,
    mt,
    mb,
    ml,
    mr,
  }: {
    theme: DefaultTheme;
    mt?: number;
    mb?: number;
    ml?: number;
    mr?: number;
  }) => css`
    margin-top: ${theme.metrics.px(mt || 0)}px;
    margin-bottom: ${theme.metrics.px(mb || 0)}px;
    margin-left: ${theme.metrics.px(ml || 0)}px;
    margin-right: ${theme.metrics.px(mr || 0)}px;
  `}
`;

export const Bottom = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-top: ${theme.metrics.px(0)}px;
    margin-bottom: ${theme.metrics.px(55)}px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  `}
`;