import { Image } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const Badge = styled.View<{ size: number; dark: boolean }>`
  ${({
    theme,
    size,
    dark,
  }: {
    theme: DefaultTheme;
    size: number;
    dark: boolean;
  }) => css`
    width: ${theme.metrics.px(size)}px;
    height: ${theme.metrics.px(size)}px;
    border-radius: ${theme.metrics.px(8)}px;
    align-items: center;
    justify-content: center;
    background-color: ${dark ? theme.colors.backgroundDark : theme.colors.white};
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.primary500};
  `}
`;

// Real brand logo, inset slightly inside the badge and contained so wide/tall marks both fit.
export const BadgeLogo = styled(Image).attrs({ contentFit: 'contain' })<{ size: number }>`
  ${({ theme, size }: { theme: DefaultTheme; size: number }) => css`
    width: ${theme.metrics.px(size - 8)}px;
    height: ${theme.metrics.px(size - 8)}px;
    border-radius: ${theme.metrics.px(6)}px;
  `}
`;

export const BadgeInitials = styled.Text<{
  tone: keyof DefaultTheme['colors'];
  fontSize: number;
}>`
  ${({
    theme,
    tone,
    fontSize,
  }: {
    theme: DefaultTheme;
    tone: keyof DefaultTheme['colors'];
    fontSize: number;
  }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(fontSize)}px;
    letter-spacing: 0.5px;
    color: ${theme.colors[tone]};
  `}
`;
