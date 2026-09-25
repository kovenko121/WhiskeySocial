import styled, { css, DefaultTheme } from 'styled-components/native';

export const Content = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding: 0 ${theme.metrics.px(24)}px ${theme.metrics.px(28)}px;
    gap: ${theme.metrics.px(16)}px;
  `}
`;

export const HeaderRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${theme.metrics.px(12)}px;
  `}
`;

export const CloseChip = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(32)}px;
    height: ${theme.metrics.px(32)}px;
    flex-shrink: 0;
    border-radius: ${theme.metrics.px(100)}px;
    background-color: ${theme.colors.grey400};
    align-items: center;
    justify-content: center;
  `}
`;

export const CloseChipText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(13)}px;
    color: ${theme.colors.grey100};
  `}
`;

export const Title = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(22)}px;
    color: ${theme.colors.white};
  `}
`;

export const Tips = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(18)}px;
  `}
`;

export const Tip = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(14)}px;
  `}
`;

type TipTileTokens = {
  bg: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed';
};

export const TipTileSlot = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(48)}px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  `}
`;

export const TipTile = styled.View<{ tokens: TipTileTokens }>`
  ${({ theme, tokens }: { theme: DefaultTheme; tokens: TipTileTokens }) => css`
    width: ${theme.metrics.px(34)}px;
    height: ${theme.metrics.px(34)}px;
    border-radius: ${theme.metrics.px(6)}px;
    align-items: center;
    justify-content: center;
    padding: ${theme.metrics.px(4)}px;
    background-color: ${tokens.bg};
    /* Dashed borders are drawn by the DashedBorder SVG overlay (RN can't dash a rounded border). */
    border-width: ${tokens.borderStyle === 'dashed' ? 0 : theme.metrics.px(tokens.borderWidth)}px;
    border-color: ${tokens.borderColor};
    border-style: solid;
  `}
`;

// resizeMode pinned via attrs (not a JSX prop) so contain is guaranteed on both iOS and Android;
// fadeDuration:0 skips Android's default fade-in so the logo appears in step with the sheet.
export const TipLogo = styled.Image.attrs({ resizeMode: 'contain', fadeDuration: 0 })`
  width: 100%;
  height: 100%;
`;

export const TipGlassAnchor = styled.View`
  position: absolute;
  right: -7px;
  top: 50%;
  margin-top: -16px;
`;

export const TipFavBadge = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: absolute;
    right: -6px;
    bottom: -6px;
    width: ${theme.metrics.px(18)}px;
    height: ${theme.metrics.px(18)}px;
    border-radius: ${theme.metrics.px(9)}px;
    align-items: center;
    justify-content: center;
    background-color: ${theme.colors.grey600};
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.red};
  `}
`;

export type { TipTileTokens };

export const TipText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(13)}px;
    line-height: ${theme.metrics.px(19)}px;
    color: ${theme.colors.grey70};
  `}
`;

export const TipTextBold = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    color: ${theme.colors.white};
  `}
`;

export const MapAction = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(12)}px;
    padding: ${theme.metrics.px(12)}px ${theme.metrics.px(14)}px;
    border-radius: ${theme.metrics.px(10)}px;
    background-color: ${theme.colors.grey500};
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.primary700};
  `}
`;

export const MapActionCopy = styled.View`
  flex: 1;
`;

export const MapActionTitle = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(13)}px;
    color: ${theme.colors.white};
  `}
`;

export const MapActionBody = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(2)}px;
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(11)}px;
    line-height: ${theme.metrics.px(16)}px;
    color: ${theme.colors.grey70};
  `}
`;

export const Consent = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(12)}px;
    padding: ${theme.metrics.px(14)}px;
    border-radius: ${theme.metrics.px(10)}px;
    background-color: ${theme.colors.grey500};
  `}
`;

export const ConsentCopy = styled.View`
  flex: 1;
`;

export const ConsentTitle = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(13)}px;
    color: ${theme.colors.white};
  `}
`;

export const ConsentBody = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(4)}px;
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(11)}px;
    line-height: ${theme.metrics.px(16)}px;
    color: ${theme.colors.grey70};
  `}
`;

export const ConsentEmail = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    color: ${theme.colors.grey100};
  `}
`;

export const Footer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(8)}px;
    gap: ${theme.metrics.px(12)}px;
  `}
`;

export const FooterHint = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(11)}px;
    text-align: center;
    color: ${theme.colors.grey200};
  `}
`;
