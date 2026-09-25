import styled, { css, DefaultTheme } from 'styled-components/native';

export type LeaderRowVariant = 'full' | 'preview';

// The rank pill and card border use the app's primary tone / white at low opacity. There is no
// colour-opacity helper in the codebase, so these follow the existing inline-rgba convention (e.g.
// Post/styles.ts). 166,158,109 is theme.colors.primary500.
const RANK_FILL = 'rgba(166, 158, 109, 0.15)';
const CARD_HAIRLINE = 'rgba(255, 255, 255, 0.06)';

export const RowContainer = styled.Pressable<{ variant: LeaderRowVariant }>`
  ${({ theme, variant }: { theme: DefaultTheme; variant: LeaderRowVariant }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(10)}px;
    background-color: ${theme.colors.grey400};
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${CARD_HAIRLINE};
    border-radius: ${theme.metrics.px(10)}px;
    padding-vertical: ${theme.metrics.px(variant === 'preview' ? 7 : 9)}px;
    padding-left: ${theme.metrics.px(8)}px;
    padding-right: ${theme.metrics.px(12)}px;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.25;
    shadow-radius: 6px;
    elevation: 3;
  `}
`;

export const RankCircle = styled.View<{ variant: LeaderRowVariant }>`
  ${({ theme, variant }: { theme: DefaultTheme; variant: LeaderRowVariant }) => css`
    width: ${theme.metrics.px(variant === 'preview' ? 20 : 22)}px;
    height: ${theme.metrics.px(variant === 'preview' ? 20 : 22)}px;
    border-radius: ${theme.metrics.px(11)}px;
    align-items: center;
    justify-content: center;
    background-color: ${RANK_FILL};
  `}
`;

export const Rank = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(11)}px;
    color: ${theme.colors.primary500};
  `}
`;

export const Meta = styled.View`
  flex: 1;
  min-width: 0;
`;

export const Brand = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(9)}px;
    letter-spacing: 0.5px;
    color: ${theme.colors.grey200};
  `}
`;

export const Bottle = styled.Text<{ variant: LeaderRowVariant }>`
  ${({ theme, variant }: { theme: DefaultTheme; variant: LeaderRowVariant }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(variant === 'preview' ? 12 : 13)}px;
    color: ${theme.colors.white};
  `}
`;

// Preview: a single inline "N tastes" line.
export const CountInline = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(10)}px;
    color: ${theme.colors.grey200};
  `}
`;

// Full leaderboard: the count stacked over its label.
export const CountBlock = styled.View`
  align-items: flex-end;
`;

export const Count = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.white};
  `}
`;

export const CountLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(9)}px;
    color: ${theme.colors.grey200};
  `}
`;
