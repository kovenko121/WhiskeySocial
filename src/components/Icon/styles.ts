import styled, { css, DefaultTheme } from 'styled-components/native';

export const IconWrapper = styled.View``;

export const BadgeWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.danger500};
    padding: 0px 4px;
    position: absolute;
    border-radius: ${theme.metrics.px(50)}px;
    right: ${theme.metrics.px(-12)}px;
    top: ${theme.metrics.px(-6)}px;
  `}
`;

export const BadgeText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    color: white;
    font-size: ${theme.metrics.px(9)}px;
    font-family: ${theme.fonts.bold};
    text-align: center;
  `}
`;
