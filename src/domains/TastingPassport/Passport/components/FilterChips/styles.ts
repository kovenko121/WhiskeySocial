import styled, { css, DefaultTheme } from 'styled-components/native';

export const Row = styled.ScrollView`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-grow: 0;
    margin-top: ${theme.metrics.px(14)}px;
  `}
`;

export const Chip = styled.Pressable<{ active: boolean }>`
  ${({ theme, active }: { theme: DefaultTheme; active: boolean }) => css`
    min-height: ${theme.metrics.px(26)}px;
    justify-content: center;
    padding-horizontal: ${theme.metrics.px(14)}px;
    margin-right: ${theme.metrics.px(8)}px;
    border-radius: ${theme.metrics.px(100)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.primary500};
    background-color: ${active ? theme.colors.primary500 : theme.colors.transparent};
  `}
`;

export const ChipLabel = styled.Text<{ active: boolean }>`
  ${({ theme, active }: { theme: DefaultTheme; active: boolean }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(12)}px;
    color: ${active ? theme.colors.backgroundDark : theme.colors.primary500};
  `}
`;
