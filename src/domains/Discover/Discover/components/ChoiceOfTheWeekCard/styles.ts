import { Image } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const TitleConteiner = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(8)}px;
    padding-bottom: ${theme.metrics.px(12)}px;
    flex-direction: row;
    align-items: center;
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
    margin-bottom: ${theme.metrics.px(16)}px;
  `}
`;

export const PourLogo = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(30)}px;
    width: ${theme.metrics.px(30)}px;
    background-color: ${theme.colors.primary500};
    z-index: 1;
    position: absolute;
    top: ${theme.metrics.px(270)}px;
    right: ${theme.metrics.px(10)}px;
    border-radius: ${theme.metrics.px(20)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const ChoiceInfo = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    width: 100%;
    align-items: flex-start;
    margin-bottom: ${theme.metrics.px(16)}px;
  `}
`;

export const BrandPicture = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  priority: 'low',
  cachePolicy: 'memory-disk',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-right: ${theme.metrics.px(8)}px;
    width: ${theme.metrics.px(40)}px;
    height: ${theme.metrics.px(40)}px;
    border-radius: ${theme.metrics.px(50)}px;
    background-color: ${theme.colors.grey600};
  `}
`;

export const NameSection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(8)}px;
    width: 85%;
  `}
`;

export const RatingContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(2)}px;
    align-items: center;
  `}
`;

export const TagContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(40)}px;
    position: absolute;
    top: ${theme.metrics.px(-315)}px;
    left: ${theme.metrics.px(10)}px;
  `}
`;

export const SkeletonSpacer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(8)}px;
    width: ${theme.metrics.px(8)}px;
  `}
`;

export const SkeletonEmpty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(200)}px;
  `}
`;
