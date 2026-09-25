import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const ErrorContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(32)}px;
  `}
`;

export const CoverPhotoContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: ${theme.metrics.hp(25)}px;
    background-color: ${theme.colors.grey400};
  `}
`;

export const CoverPhoto = styled.Image`
  width: 100%;
  height: 100%;
`;

export const CoverPhotoPlaceholder = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.grey400};
    justify-content: center;
    align-items: center;
  `}
`;

export const ProfilePictureContainer = styled.View`
  align-items: center;
  margin-top: -50px;
  z-index: 10;
`;

export const ProfilePicture = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  border-width: 4px;
  border-color: #fff;
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-top: ${theme.metrics.px(16)}px;
  `}
`;

export const PrivacyRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

export const ClubNameText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(24)}px;
    font-weight: 700;
    color: ${theme.colors.white};
    text-align: center;
  `}
`;

export const PrivacyBadge = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-left: ${theme.metrics.px(8)}px;
    width: ${theme.metrics.px(32)}px;
    height: ${theme.metrics.px(32)}px;
    border-radius: ${theme.metrics.px(16)}px;
    background-color: ${theme.colors.primary500};
    justify-content: center;
    align-items: center;
  `}
`;

export const ClubDetailsText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.grey200};
    text-align: center;
    line-height: ${theme.metrics.px(20)}px;
    margin-bottom: ${theme.metrics.px(20)}px;
  `}
`;

export const StatsBar = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    background-color: ${theme.colors.grey400};
    border-radius: ${theme.metrics.px(12)}px;
    padding-vertical: ${theme.metrics.px(16)}px;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;

export const StatsColumn = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const StatsValue = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(24)}px;
    font-weight: 700;
    color: ${theme.colors.primary500};
  `}
`;

export const StatsLabel = styled.Text<{ tappable?: boolean }>`
  ${({ theme, tappable }: { theme: DefaultTheme; tappable?: boolean }) => css`
    font-size: ${theme.metrics.px(12)}px;
    color: ${tappable ? theme.colors.primary500 : theme.colors.grey200};
    margin-top: ${theme.metrics.px(4)}px;
  `}
`;

export const StatsDivider = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(1)}px;
    height: 100%;
    background-color: ${theme.colors.warning};
  `}
`;

export const AdminButtonsRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(12)}px;
    margin-top: ${theme.metrics.px(16)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const AdminButtonWrapper = styled.View`
  flex: 1;
`;

export const TappableStatsColumn = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const StatsLabelRow = styled.View`
  flex-direction: row;
  align-items: center;
  position: relative;
`;

export const ChevronWrapper = styled.View`
  position: absolute;
  right: -16px;
  top: 6px;
`;

export const ErrorText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(16)}px;
    text-align: center;
    color: ${theme.colors.white};
  `}
`;

export const PlaceholderContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(20)}px;
  `}
`;

export const PlaceholderText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    text-align: center;
    color: ${theme.colors.grey300};
  `}
`;
