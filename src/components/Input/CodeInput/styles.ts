import Styled, { css , DefaultTheme } from 'styled-components/native';

export const CellContainer = Styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(48)}px;
    height: ${theme.metrics.px(48)}px;
    border-width: 1.5px;
    background-color: ${theme.colors.white};
    border-radius: ${theme.metrics.px(8)}px;
    border-color: ${theme.colors.primary};
    margin-horizontal: ${theme.metrics.px(2)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const CellText = Styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(32)}px;
    color: ${theme.colors.black};
    font-family: ${theme.fonts.bold};
    text-align: center;
  `}
`;
