import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Appearance, ViewProps } from 'react-native';
import { WebView } from 'react-native-webview';
import styled, { css, DefaultTheme } from 'styled-components/native';
import { colors } from '../../../../styles/colors';

export const ResponsiveRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: flex-start;
    gap: ${theme.metrics.px(5)}px;
    align-items: center;
    width: 100%;
    padding-vertical: ${theme.metrics.px(10)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const Row = styled.View<ViewProps>`
  flex-direction: row;
  align-items: center;
`;

export const RowContainer = styled.View`
  flex-direction: row;
  gap: 12px;
`;

export const RewardsContainer = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(13)}px;
    padding-left: ${theme.metrics.px(36)}px;
    padding-top: ${theme.metrics.px(10)}px;
    width: 100%;
  `}
`;

export const RewardIconContainer = styled.Image`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(39)}px;
    height: ${theme.metrics.px(32)}px;
  `}
`;

export const FollowContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(10)}px;
    padding-left: ${theme.metrics.px(12)}px;
    /* background-color: green; */
  `}
`;

export const ActionButtonsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-left: ${theme.metrics.px(12)}px;
    gap: ${theme.metrics.px(6)}px;
    align-self: flex-end;
  `}
`;

export const TitleWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    width: ${theme.metrics.wp(50)};
  `}
`;

export const Column = styled.View`
  flex-direction: column;
`;

export const VenueInfo = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: column;
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-top: ${theme.metrics.px(12)}px;
    gap: ${theme.metrics.px(4)}px;
  `}
`;

export const VenueMenu = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const HandleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(5)}px;
    width: 100%;
    margin-vertical: ${theme.metrics.px(10)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const MenuModal = styled(BottomSheetModal).attrs({
  backgroundStyle: {
    backgroundColor:
      Appearance.getColorScheme() === 'dark'
        ? colors.backgroundWebViewDark
        : colors.backgroundWebViewLigth,
  },
})``;

export const HandleBar = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.primary};
    height: ${theme.metrics.px(5)}px;
    width: ${theme.metrics.px(40)}px;
    border-radius: ${theme.metrics.px(20)}px;
  `}
`;

export const VenueMenuView = styled(WebView)`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: column;
    width: ${theme.metrics.wp(100)}px;
    position: absolute;
    top: 40;
    height: ${theme.metrics.hp(100)}px;
    background-color: transparent;
  `}
`;
