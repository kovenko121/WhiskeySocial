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
    margin-bottom: ${theme.metrics.px(150)}px;
  `}
`;

export const WhiskeyImageContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.hp(49)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
    width: 100%;
  `}
`;

export const WhiskeyImage = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
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
    margin-bottom: ${theme.metrics.px(6)}px;
    justify-content: center;
  `}
`;

export const RatingContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(10)}px;
    flex-direction: row;
    gap: ${theme.metrics.hp(1)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(50)}px;
  `}
`;

export const StatusBar = styled(Animated.View)<{ theme: DefaultTheme; insets: any }>`
  ${({ theme, insets }) => css`
    height: ${insets.top}px;
    width: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const TagsContainer = styled.View<{ theme: DefaultTheme }>`
  ${({ theme }) => css`
    padding-vertical: ${theme.metrics.px(8)}px;
    padding-bottom: ${theme.metrics.px(0)}px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${theme.metrics.px(8)}px;
  `}
`;

export const SectionTitleSkeletonWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    padding-vertical: ${theme.metrics.px(10)}px;
    margin-bottom: ${theme.metrics.px(10)}px;
  `}
`;

export const InfoContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(16)}px;
  `}
`;

export const KeyWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(120)};
  `}
`;

export const TextWrapper = styled.View<{ theme: DefaultTheme }>`
  ${() => css`
    flex: 1;
  `}
`;

export const SectionTitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.metrics.px(15)}px;
  `}
`;

export const LinkContainer = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(5)}px;
  `}
`;
