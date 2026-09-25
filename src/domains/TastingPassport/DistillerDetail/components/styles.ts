import { Image } from 'expo-image';
import { theme as appTheme } from '@theme';
import styled, { css, DefaultTheme } from 'styled-components/native';

const CARD_RADIUS = appTheme.metrics.px(12);

export const ToggleWrap = styled.Pressable<{
  active: boolean;
  activeColor: keyof DefaultTheme['colors'];
}>`
  ${({
    theme,
    active,
    activeColor,
  }: {
    theme: DefaultTheme;
    active: boolean;
    activeColor: keyof DefaultTheme['colors'];
  }) => css`
    flex: 1;
    min-height: ${theme.metrics.px(44)}px;
    align-items: center;
    justify-content: center;
    gap: ${theme.metrics.px(4)}px;
    padding-vertical: ${theme.metrics.px(8)}px;
    border-radius: ${theme.metrics.px(10)}px;
    background-color: ${active ? theme.colors.grey500 : theme.colors.grey400};
    border-width: ${theme.metrics.px(2)}px;
    border-color: ${active
      ? theme.colors[activeColor]
      : theme.colors.transparent};
  `}
`;

export const ToggleLabel = styled.Text<{
  active: boolean;
  activeColor: keyof DefaultTheme['colors'];
}>`
  ${({
    theme,
    active,
    activeColor,
  }: {
    theme: DefaultTheme;
    active: boolean;
    activeColor: keyof DefaultTheme['colors'];
  }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(12)}px;
    color: ${active ? theme.colors[activeColor] : theme.colors.grey100};
  `}
`;

/* Card and its Tasted/Favorite pair, which the design hangs below the card rather than inside it. */
export const PourCardWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(16)}px;
  `}
`;

/*
 * Pressable so a catalogue bottle opens its own page; inert when the pour has none.
 *
 * The floor is taller than the text it holds on purpose: name/brand only read as pinned to
 * the top and the style chip to the bottom while the card has height to spare. At 96px — the
 * product tile's own width — the text filled it exactly and the split was invisible.
 */
export const PourCardContainer = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: stretch;
    min-height: ${theme.metrics.px(120)}px;
    background-color: ${theme.colors.grey500};
    border-radius: ${CARD_RADIUS}px;
    overflow: hidden;
  `}
`;

/*
 * Product shot runs flush to the card's left edge, the design's 96px tile on its darker well.
 * It carries the card's own radius on that edge: the parent's overflow clip alone leaves the
 * corners square on Android.
 */
export const PourThumb = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(96)}px;
    background-color: ${theme.colors.grey600};
    align-items: center;
    justify-content: center;
    border-top-left-radius: ${CARD_RADIUS}px;
    border-bottom-left-radius: ${CARD_RADIUS}px;
  `}
`;

/*
 * Fills the tile edge to edge and carries the rounded edge itself, the way the app's whiskey
 * list card renders this same `picture` asset. Rounding only the tile behind it leaves an
 * opaque product shot sitting square-cornered on top of it.
 */
export const PourImage = styled(Image).attrs({
  contentFit: 'cover',
  cachePolicy: 'memory-disk',
})`
  ${() => css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-top-left-radius: ${CARD_RADIUS}px;
    border-bottom-left-radius: ${CARD_RADIUS}px;
  `}
`;

/* Stretched so the text column owns the card's full height and can split top from bottom. */
export const PourBody = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    flex-direction: row;
    align-items: stretch;
    justify-content: space-between;
    gap: ${theme.metrics.px(8)}px;
    padding-vertical: ${theme.metrics.px(12)}px;
    padding-horizontal: ${theme.metrics.px(14)}px;
  `}
`;

/* Name and brand ride the top edge, the style chip the bottom, however tall the card grows. */
export const PourInfo = styled.View`
  flex: 1;
  justify-content: space-between;
`;

export const PourHeading = styled.View`
  align-items: stretch;
`;

/*
 * Bottle name carries the design system's whiskey-card title treatment — the tan-gold
 * accent, not white. Long names wrap to a second line; the card's min-height lets it grow.
 */
export const PourName = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(15)}px;
    line-height: ${theme.metrics.px(19)}px;
    color: ${theme.colors.primary500};
  `}
`;

export const PourMeta = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(12)}px;
    color: ${theme.colors.grey200};
    margin-top: ${theme.metrics.px(2)}px;
  `}
`;

/* Holds the style chip to its own width — a stretched pill reads as a button. */
export const PourTagRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-self: flex-start;
    max-width: 100%;
    margin-top: ${theme.metrics.px(6)}px;
  `}
`;

export const PourStat = styled.View`
  align-items: flex-end;
  justify-content: center;
`;

export const PourRating = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(4)}px;
  `}
`;

export const PourStatValue = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.warning};
  `}
`;

export const PourStatLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(10)}px;
    color: ${theme.colors.grey200};
  `}
`;

/* Full card width — the buttons line up with the card's edges, not with its inset text. */
export const PourToggleRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(8)}px;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;
