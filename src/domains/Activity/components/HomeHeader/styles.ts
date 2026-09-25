import { Image } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const TopHeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const IconContainer = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(10)}px;
    padding-left: ${theme.metrics.px(28)}px;
    padding-top: ${theme.metrics.px(18)}px;
  `}
`;

export const RewardsContainer = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(10)}px;
    padding-left: ${theme.metrics.px(32)}px;
    padding-top: ${theme.metrics.px(18)}px;
  `}
`;

export const Logo = styled(Image)`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(167)}px;
  `}
`;

export const MainIcons = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const HeaderContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    min-height: ${theme.metrics.px(180)}px;
    max-height: ${theme.metrics.px(180)}px;
  `}
`;

export const PostButton = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(8)}px;
    background-color: ${theme.colors.transparent};
    min-height: ${theme.metrics.px(50)}px;
    padding-horizontal: ${theme.metrics.px(14)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.primary500};
    border-radius: ${theme.metrics.px(8)}px;
    margin-top: 19.8px;
    justify-content: space-between;
  `}
`;

export const Buttons = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-vertical: ${theme.metrics.px(16)}px;
    padding-bottom: ${theme.metrics.px(4)}px;
  `}
`;

export const RewardIconContainer = styled.Image.attrs({
  resizeMode: 'contain',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(26)}px;
    height: ${theme.metrics.px(22)}px;
  `}
`;
