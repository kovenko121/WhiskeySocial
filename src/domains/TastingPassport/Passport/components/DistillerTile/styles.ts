import { Image } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';

type TileTokens = {
  bg: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed';
  chipColor: keyof DefaultTheme['colors'];
  chipBorderColor: string;
  chipBorderWidth: number;
  chipBorderStyle: 'solid' | 'dashed';
};

export const Cell = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    gap: ${theme.metrics.px(6)}px;
    width: ${theme.metrics.px(74)}px;
  `}
`;

export const TileRing = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding: ${theme.metrics.px(2)}px;
    background-color: ${theme.colors.white};
    border-radius: ${theme.metrics.px(10)}px;
  `}
`;

export const Tile = styled.View<{ tokens: TileTokens }>`
  ${({ theme, tokens }: { theme: DefaultTheme; tokens: TileTokens }) => css`
    width: ${theme.metrics.px(62)}px;
    height: ${theme.metrics.px(62)}px;
    border-radius: ${theme.metrics.px(8)}px;
    align-items: center;
    justify-content: center;
    overflow: visible;
    background-color: ${tokens.bg};
    /* RN can't dash a rounded border, so DashedBorder draws it as an SVG overlay; drop the native
       border there to leave the overlay's stroke the band a solid border would have occupied. */
    border-width: ${tokens.borderStyle === 'dashed' ? 0 : theme.metrics.px(tokens.borderWidth)}px;
    border-color: ${tokens.borderColor};
    border-style: solid;
  `}
`;

// Covered, not contained: a lot of the supplied artwork carries its own pale letterbox bands, and
// cropping to fill hides them.
export const TileLogo = styled(Image).attrs({ contentFit: 'cover' })`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(50)}px;
    height: ${theme.metrics.px(50)}px;
    border-radius: ${theme.metrics.px(6)}px;
  `}
`;

export const Initials = styled.Text<{ tone: keyof DefaultTheme['colors'] }>`
  ${({ theme, tone }: { theme: DefaultTheme; tone: keyof DefaultTheme['colors'] }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(15)}px;
    letter-spacing: 0.5px;
    color: ${theme.colors[tone]};
  `}
`;

export const GlassAnchor = styled.View`
  position: absolute;
  right: -12px;
  top: 50%;
  margin-top: -29px;
`;

export const ChipRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(4)}px;
    height: ${theme.metrics.px(20)}px;
  `}
`;

export const StatusChip = styled.View<{ tokens: TileTokens }>`
  ${({ theme, tokens }: { theme: DefaultTheme; tokens: TileTokens }) => css`
    height: ${theme.metrics.px(20)}px;
    justify-content: center;
    border-radius: ${theme.metrics.px(100)}px;
    padding-horizontal: ${theme.metrics.px(9)}px;
    /* See Tile: dashed chip outline is the DashedBorder SVG overlay, not the native border. */
    border-width: ${
      tokens.chipBorderStyle === 'dashed' ? 0 : theme.metrics.px(tokens.chipBorderWidth)
    }px;
    border-color: ${tokens.chipBorderColor};
    border-style: solid;
  `}
`;

export const ChipText = styled.Text<{ tone: keyof DefaultTheme['colors'] }>`
  ${({ theme, tone }: { theme: DefaultTheme; tone: keyof DefaultTheme['colors'] }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(9)}px;
    letter-spacing: 0.5px;
    color: ${theme.colors[tone]};
  `}
`;

export const FavBadge = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(20)}px;
    height: ${theme.metrics.px(20)}px;
    border-radius: ${theme.metrics.px(10)}px;
    align-items: center;
    justify-content: center;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.red};
  `}
`;

export const Name = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(11)}px;
    text-align: center;
    max-width: ${theme.metrics.px(80)}px;
    color: ${theme.colors.grey70};
  `}
`;

export type { TileTokens };
