import { Image } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';

// The preview is sized by height, not by the floor plan's shape. Driving it off the asset ratio
// instead makes the card 1.25× the screen width tall — the whole first screen is map, and the
// booth numbers are still too small to read, which is what the full-screen viewer is for.
const MAP_PREVIEW_HEIGHT = 300;

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const Scroll = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

export const Body = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
    /* Header bottom padding, consistent with the Passport / Leaderboard screens. */
    padding-top: ${theme.metrics.px(12)}px;
    padding-bottom: ${theme.metrics.px(40)}px;
    gap: ${theme.metrics.px(16)}px;
  `}
`;

export const MapCard = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(MAP_PREVIEW_HEIGHT)}px;
    border-radius: ${theme.metrics.px(12)}px;
    overflow: hidden;
    background-color: ${theme.colors.white};
  `}
`;

// Fills the fixed-height card and centres the plan in it, whatever shape it was uploaded in.
// `contain` leaves margin around a plan that is taller than it is wide; the card's white ground
// stands in for the paper, so that margin reads as part of the map rather than a gap.
export const MapImage = styled(Image).attrs({ contentFit: 'contain' })`
  width: 100%;
  height: 100%;
`;

export const LoadingWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

// Both chips sit over the map's white side margins, so they carry their own dark ground.
const chip = (theme: DefaultTheme) => css`
  position: absolute;
  bottom: ${theme.metrics.px(10)}px;
  flex-direction: row;
  align-items: center;
  gap: ${theme.metrics.px(6)}px;
  padding: ${theme.metrics.px(6)}px ${theme.metrics.px(10)}px;
  border-radius: ${theme.metrics.px(100)}px;
  background-color: ${theme.colors.black700};
`;

export const ZoomHint = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    ${chip(theme)}
    left: ${theme.metrics.px(10)}px;
  `}
`;

export const SaveChip = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    ${chip(theme)}
    right: ${theme.metrics.px(10)}px;
  `}
`;

// The share sheet cannot tell us whether the attendee actually chose "Save Image", so the screen
// says where the map lives instead of claiming a result it has no way to know.
export const MapHint = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(-8)}px;
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(11)}px;
    line-height: ${theme.metrics.px(15)}px;
    color: ${theme.colors.grey200};
  `}
`;

export const ChipText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(11)}px;
    color: ${theme.colors.white};
  `}
`;

export const Callout = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(12)}px;
    padding: ${theme.metrics.px(14)}px;
    border-radius: ${theme.metrics.px(12)}px;
    background-color: ${theme.colors.grey500};
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.primary700};
  `}
`;

export const CalloutBadge = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(44)}px;
    height: ${theme.metrics.px(44)}px;
    flex-shrink: 0;
    border-radius: ${theme.metrics.px(8)}px;
    align-items: center;
    justify-content: center;
    background-color: ${theme.colors.primary600};
  `}
`;

export const CalloutBadgeNumber = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(20)}px;
    color: ${theme.colors.grey600};
  `}
`;

export const CalloutCopy = styled.View`
  flex: 1;
`;

export const CalloutTitle = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.white};
  `}
`;

export const CalloutBody = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(4)}px;
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(12)}px;
    line-height: ${theme.metrics.px(17)}px;
    color: ${theme.colors.grey70};
  `}
`;

export const SectionTitle = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(8)}px;
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(18)}px;
    color: ${theme.colors.primary500};
  `}
`;

export const Directory = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    border-radius: ${theme.metrics.px(12)}px;
    overflow: hidden;
    background-color: ${theme.colors.grey600};
  `}
`;

type RowProps = { theme: DefaultTheme; highlighted: boolean; last: boolean };

export const DirectoryRow = styled.View<Omit<RowProps, 'theme'>>`
  ${({ theme, highlighted, last }: RowProps) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(12)}px;
    padding: ${theme.metrics.px(10)}px ${theme.metrics.px(12)}px;
    border-bottom-width: ${last ? 0 : theme.metrics.px(1)}px;
    border-bottom-color: ${theme.colors.grey500};
    background-color: ${highlighted ? theme.colors.grey500 : theme.colors.transparent};
  `}
`;

export const RowNumber = styled.View<{ highlighted: boolean }>`
  ${({ theme, highlighted }: { theme: DefaultTheme; highlighted: boolean }) => css`
    width: ${theme.metrics.px(30)}px;
    height: ${theme.metrics.px(26)}px;
    flex-shrink: 0;
    border-radius: ${theme.metrics.px(6)}px;
    align-items: center;
    justify-content: center;
    background-color: ${highlighted ? theme.colors.primary600 : theme.colors.grey400};
  `}
`;

export const RowNumberText = styled.Text<{ highlighted: boolean }>`
  ${({ theme, highlighted }: { theme: DefaultTheme; highlighted: boolean }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(12)}px;
    color: ${highlighted ? theme.colors.grey600 : theme.colors.grey50};
  `}
`;

export const RowName = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(14)}px;
    line-height: ${theme.metrics.px(19)}px;
    color: ${theme.colors.grey50};
  `}
`;
