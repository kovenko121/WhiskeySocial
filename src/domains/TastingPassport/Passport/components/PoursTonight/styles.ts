import { Image } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';

/* Brand mark: the design's badge size against the 96px tile — small enough to stay
   out of the bottle's way, big enough to read at arm's length in a dim room. */
const CHIP = 32;

const HEART_SIZE = 30;
const HEART_INSET = 8;
const INFO_PADDING = 16;

const HEART_CLEARANCE = HEART_INSET + HEART_SIZE + HEART_INSET - INFO_PADDING;

export const Container = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(24)}px;
  `}
`;

export const Label = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(11)}px;
    letter-spacing: 0.5px;
    color: ${theme.colors.grey200};
    margin-bottom: ${theme.metrics.px(10)}px;
  `}
`;

export const Empty = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(13)}px;
    color: ${theme.colors.grey200};
  `}
`;

export const List = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(8)}px;
  `}
`;

export const Card = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: relative;
    flex-direction: row;
    min-height: ${theme.metrics.px(104)}px;
    background-color: ${theme.colors.primary400};
    border-radius: ${theme.metrics.px(8)}px;
    overflow: hidden;
  `}
`;

export const ProductTile = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(96)}px;
    background-color: ${theme.colors.white};
    align-items: center;
    justify-content: center;
  `}
`;

/*
 * Contained, not cropped — bottle shots are tall and a cover fit would behead them.
 * Absolutely inset so the artwork never drives layout: in flow, a tall bottle's
 * intrinsic ratio stretches the card far past its 104px row height.
 */
export const BottleImage = styled(Image).attrs({ contentFit: 'contain' })`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: absolute;
    top: ${theme.metrics.px(6)}px;
    left: ${theme.metrics.px(6)}px;
    right: ${theme.metrics.px(6)}px;
    bottom: ${theme.metrics.px(6)}px;
  `}
`;

/* Bare mark on the white tile, the way the search list's brand badge sits on a
   whiskey card — no disc, no ring, no shadow behind it. */
export const BrandChip = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: absolute;
    top: ${theme.metrics.px(6)}px;
    left: ${theme.metrics.px(6)}px;
    width: ${theme.metrics.px(CHIP)}px;
    height: ${theme.metrics.px(CHIP)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const BrandChipLogo = styled(Image).attrs({ contentFit: 'contain' })`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(CHIP)}px;
    height: ${theme.metrics.px(CHIP)}px;
  `}
`;

export const BrandChipText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(12)}px;
    letter-spacing: 0.5px;
    color: ${theme.colors.grey500};
  `}
`;

export const Info = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: space-between;
    padding-vertical: ${theme.metrics.px(12)}px;
    padding-horizontal: ${theme.metrics.px(INFO_PADDING)}px;
  `}
`;

export const PourBottle = styled.Text<{ clearsHeart: boolean }>`
  ${({ theme, clearsHeart }: { theme: DefaultTheme; clearsHeart: boolean }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(15)}px;
    line-height: ${theme.metrics.px(20)}px;
    color: ${theme.colors.white};
    padding-right: ${theme.metrics.px(clearsHeart ? HEART_CLEARANCE : 0)}px;
  `}
`;

export const InfoBottom = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.metrics.px(8)}px;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;

export const Proof = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(18)}px;
    color: ${theme.colors.white};
  `}
`;

export const Tag = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-vertical: ${theme.metrics.px(4)}px;
    padding-horizontal: ${theme.metrics.px(10)}px;
    border-radius: ${theme.metrics.px(100)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.white};
  `}
`;

export const TagText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(11)}px;
    color: ${theme.colors.white};
  `}
`;

export const HeartOverlay = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: absolute;
    top: ${theme.metrics.px(HEART_INSET)}px;
    right: ${theme.metrics.px(HEART_INSET)}px;
    width: ${theme.metrics.px(HEART_SIZE)}px;
    height: ${theme.metrics.px(HEART_SIZE)}px;
    border-radius: ${theme.metrics.px(HEART_SIZE / 2)}px;
    align-items: center;
    justify-content: center;
    background-color: rgba(20, 18, 14, 0.55);
  `}
`;
