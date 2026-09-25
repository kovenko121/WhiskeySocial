import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ScrollContainer = styled(Animated.ScrollView)`
  width: 100%;
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
    gap: ${theme.metrics.px(8)}px;
  `}
`;

export const WhiskeyImageContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.hp(49)}px;
    margin-bottom: ${theme.metrics.px(16)}px;
    width: 100%;
  `}
`;

export const WhiskeyImage = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  cachePolicy: 'memory-disk',
})`
  height: 100%;
  width: 100%;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.grey400};
`;

export const TitleSection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    flex-direction: row;
    gap: ${theme.metrics.hp(1)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const StatusBar = styled(Animated.View)`
  ${({ theme, insets }: { theme: DefaultTheme; insets: any }) => css`
    height: ${insets.top}px;
    width: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const TagsSection = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const TagsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(8)}px;
  `}
`;

export const Picture = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  priority: 'low',
  cachePolicy: 'memory-disk',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: ${theme.metrics.px(310)}px;
    border-radius: ${theme.metrics.px(16)}px;
    background-color: ${theme.colors.grey600};
    margin-top: ${theme.metrics.px(16)}px;
    margin-bottom: ${theme.metrics.px(16)}px;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(10)}px;
  `}
`;
