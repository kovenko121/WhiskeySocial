import styled, { css, DefaultTheme } from 'styled-components/native';

export const DividerBar = styled.View`
  ${({ theme, color = 'grey300', mv=20 }: { theme: DefaultTheme, color: keyof DefaultTheme['colors'], mv?: number }) => css`
    flex: 1;
    height: 1px;
    background-color: ${theme.colors[color]};
    margin-vertical: ${theme.metrics.px(mv)}px;
  `}
`;

export const DividerContainer = styled.View`
  ${({
    theme,
    mv,
    mt,
    mb,
    size,
  }: {
    theme: DefaultTheme;
    mv: number;
    mt: number;
    mb: number;
    size: number;
  }) => css`
    display: flex;
    flex-direction: row;
    width: ${size || 100}%;
    align-items: center;
    margin-vertical: ${theme.metrics.px(mv || 0)}px;
    margin-bottom: ${theme.metrics.px(mb || 0)}px;
    margin-top: ${theme.metrics.px(mt || 0)}px;
  `}
`;
