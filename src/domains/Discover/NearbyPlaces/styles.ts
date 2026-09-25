import MapView from 'react-native-maps';
import styled, { css, DefaultTheme } from 'styled-components/native';
import myMarker from '../../../../assets/images/my-marker-padded.png';
import whiskySocialMarker from '../../../../assets/images/ws-venue.png';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    justify-content: flex-start;
  `}
`;

export const ContentContainer = styled.View`
  flex: 1;
`;

export const SearchContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(24)}px;
    padding-horizontal: ${theme.metrics.px(22)}px;
    z-index: 1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: ${theme.metrics.px(60)}px;
  `}
`;

export const IconContainer = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    height: ${theme.metrics.px(22)}px;
    width: ${theme.metrics.px(22)}px;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.metrics.px(50)}px;
    background: ${theme.colors.grey400};
    margin-top: ${theme.metrics.px(26)}px;
  `}
`;

export const SearchButton = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(6)}px;
    background-color: ${theme.colors.white};
    width: 91%;
    min-height: ${theme.metrics.px(50)}px;
    padding-horizontal: ${theme.metrics.px(16)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.primary500};
    border-radius: ${theme.metrics.px(50)}px;
    margin-top: ${theme.metrics.px(26)}px;
    padding-vertical: ${theme.metrics.px(6)}px;
  `}
`;

export const Map = styled(MapView)`
  ${() => css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  `}
`;

export const MyMarker = styled.Image.attrs({ source: myMarker })`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(40)}px;
    width: ${theme.metrics.px(40)}px;
  `}
`;

export const WsVenueMarker = styled.Image.attrs({ source: whiskySocialMarker })`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(32)}px;
    width: ${theme.metrics.px(32)}px;
  `}
`;

export const VenueCardOverlay = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: absolute;
    bottom: ${theme.metrics.px(40)}px;
    left: ${theme.metrics.px(16)}px;
    right: ${theme.metrics.px(16)}px;
    background-color: ${theme.colors.backgroundDark};
    border-radius: ${theme.metrics.px(12)}px;
    padding: ${theme.metrics.px(16)}px;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.3;
    shadow-radius: 8px;
    elevation: 5;
  `}
`;

export const VenueCardName = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(16)}px;
    font-weight: bold;
    color: ${theme.colors.white};
    margin-bottom: ${theme.metrics.px(4)}px;
    padding-right: ${theme.metrics.px(24)}px;
  `}
`;

export const VenueCardAddress = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(12)}px;
    color: ${theme.colors.grey100};
    margin-bottom: ${theme.metrics.px(10)}px;
  `}
`;

export const VenueCardRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const VenueCardDistance = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(13)}px;
    color: ${theme.colors.grey100};
  `}
`;

export const CheckinButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.primary};
    border-radius: ${theme.metrics.px(20)}px;
    padding-horizontal: ${theme.metrics.px(16)}px;
    padding-vertical: ${theme.metrics.px(8)}px;
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(6)}px;
  `}
`;
