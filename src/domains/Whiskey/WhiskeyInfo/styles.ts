import { Image, ImageProps } from 'expo-image';
import { ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import styled, { css, DefaultTheme } from 'styled-components/native';

type ButtonContainerProps = {
  width?: number;
};

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
    padding-bottom: ${theme.metrics.px(0)}px;
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
})<ImageProps>`
  height: 100%;
  width: 100%;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.grey400};
`;

export const ScreenFlatList = styled.FlatList`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.hp(1)}px;
  `}
`;

export const ReviewContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
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
    margin-bottom: ${theme.metrics.px(24)}px;
    flex-direction: row;
    gap: ${theme.metrics.hp(1)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const ButtonsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${theme.metrics.px(20)}px;
  `}
`;

export const ButtonContainer = styled.View<ViewProps & ButtonContainerProps>`
  ${({ width = 49 }) => css`
    width: ${width}%;
  `}
`;

export const Divider = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: 1px;
    background-color: ${theme.colors.grey400};
  `}
`;

export const CharacteristicsRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    width: 100%;
    margin-vertical: ${theme.metrics.px(16)}px;
    justify-content: flex-start;
  `}
`;

export const CharacteristicsTitle = styled.View`
  width: 25%;
`;

export const CharacteristicsDescription = styled.View`
  flex-direction: row;
  width: 75%;
  align-items: center;
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(50)}px;
  `}
`;

export const StatusBar = styled(Animated.View)<any>`
  ${({ theme, insets }) => css`
    height: ${insets.top}px;
    width: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const TagsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-vertical: ${theme.metrics.px(8)}px;
    padding-bottom: ${theme.metrics.px(0)}px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${theme.metrics.px(8)}px;
  `}
`;

export const TitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    flex-direction: row;
    gap: ${theme.metrics.hp(1)}px;
    align-items: center;
    justify-content: flex-start;
    margin-top: ${theme.metrics.px(24)}px;
    margin-bottom: ${theme.metrics.px(12)}px;
  `}
`;

export const WhereToFindContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    margin-top: ${theme.metrics.px(24)}px;
    margin-bottom: ${theme.metrics.px(12)}px;
  `}
`;

export const LinkContainer = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(8)}px;
    padding-top: ${theme.metrics.px(12)}px;
  `}
`;

export const PourLogo = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(30)}px;
    width: ${theme.metrics.px(30)}px;
    background-color: ${theme.colors.primary500};
    z-index: 1;
    position: absolute;
    bottom: ${theme.metrics.px(20)}px;
    right: ${theme.metrics.px(20)}px;
    border-radius: ${theme.metrics.px(20)}px;
    align-items: center;
    justify-content: center;
  `}
`;
