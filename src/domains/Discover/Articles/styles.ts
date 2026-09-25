import { Image } from 'expo-image';
import { DefaultTheme } from 'styled-components';
import styled, { css } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
    display: flex;
  `}
`;

export const ContentContainer = styled.ScrollView`
  flex: 1;
`;

export const HeaderContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(8)}px;
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
    border-radius: ${theme.metrics.px(10)}px;
    background-color: ${theme.colors.grey600};
    margin-top: ${theme.metrics.px(16)}px;
  `}
`;

export const FilterSection = styled.View`
  ${({
    theme,
    isFavorite = false,
  }: {
    theme: DefaultTheme;
    isFavorite: boolean;
  }) => css`
    align-items: left;
    padding-top: ${theme.metrics.px(16)}px;
    ${isFavorite ? `margin-bottom: ${theme.metrics.px(8)}px;` : ''}
  `}
`;

export const TitleSection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: space-between;
    margin-top: ${theme.metrics.px(16)}px;
  `}
`;

export const TitleWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(275)}px;
  `}
`;

export const HeaderSpacing = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.backgroundDark};
    height: ${theme.metrics.px(10)}px;
  `}
`;

export const TagsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(8)}px;
    margin-vertical: ${theme.metrics.px(16)}px;
  `}
`;

export const SkeletonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-top: ${theme.metrics.px(30)}px;
  `}
`;

export const ShareButtonContainer = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: absolute;
    right: ${theme.metrics.px(15)}px;
    top: ${theme.metrics.px(30)}px;
    background-color: ${theme.colors.backgroundDark};
    border-radius: ${theme.metrics.px(50)}px;
    height: ${theme.metrics.px(25)}px;
    width: ${theme.metrics.px(25)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const GuidesFlatlist = styled.FlatList`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-vertical: ${theme.metrics.px(30)}px;
  `}
`;
