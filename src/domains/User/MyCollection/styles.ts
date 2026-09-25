import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Appearance } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import styled, { css, DefaultTheme } from 'styled-components/native';
import { isAndroid } from '@helpers';
import { colors } from '../../../styles/colors';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ScrollContainer = styled.ScrollView`
  width: 100%;
`;

export const ResponsiveRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-vertical: ${theme.metrics.px(10)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Column = styled.View`
  flex-direction: column;
`;

export const ButtonContainer = styled.View`
  width: 45%;
`;

export const ButtonSection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-around;
    padding-horizontal: ${theme.metrics.px(16)}px;
  `}
`;

export const ContentContainer = styled.View`
  display: flex;
`;

export const SearchContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding: 0 ${theme.metrics.px(24)}px;
    margin-top: ${theme.metrics.px(12)}px;
    margin-bottom: ${theme.metrics.px(12)}px;
  `}
`;

export const HorizontalFlatList = styled.FlatList`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-left: ${theme.metrics.px(24)}px;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 44px;
    height: ${theme.metrics.px(20)}px;
  `}
`;

export const HorizontalPadding = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-vertical: ${theme.metrics.px(20)}px;
  `}
`;

export const CommentSection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-top: ${theme.metrics.px(20)}px;
  `}
`;

export const Divider = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-vertical: ${theme.metrics.px(16)}px;
    background-color: ${theme.colors.grey400};
    width: 100%;
    height: ${theme.metrics.px(1)}px;
  `}
`;

export const EmptyPostList = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.wp(100) - theme.metrics.px(48)}px;
    align-self: center;
    justify-content: center;
  `}
`;

export const VenueInfo = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: column;
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-top: ${theme.metrics.px(12)}px;
  `}
`;

export const VenueMenu = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

export const AddWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    padding-vertical: ${theme.metrics.px(10)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
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

export const HandleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(5)}px;
    width: 100%;
    margin-vertical: ${theme.metrics.px(10)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const StatusBar = styled.View`
  ${({ theme, insets }: { theme: DefaultTheme; insets: EdgeInsets }) => css`
    height: ${insets.top}px;
    width: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;


export const CustomizeCollection = styled.View`
  flex: 1;
  min-width: 999px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SafeAreaView = styled.SafeAreaView`
  flex: 1;
`;

export const FooterLoaderWrapper = styled.View<{ bottomInset: number }>`
  ${({ bottomInset }: { bottomInset: number }) => css`
    justify-content: center;
    align-items: center;
    ${isAndroid &&
    css`
      padding-bottom: ${bottomInset}px;
    `}
  `}
`;
