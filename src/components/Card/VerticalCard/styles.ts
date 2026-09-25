import { Image } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const CardBody = styled.TouchableOpacity`
  ${({
    theme,
    mv,
    backgoundColor,
  }: {
    theme: DefaultTheme;
    mv: number;
    backgoundColor: keyof typeof theme.colors;
  }) => css`
    display: flex;
    flex-direction: column;
    background-color: ${theme.colors[backgoundColor]};
    border-radius: ${theme.metrics.px(8)}px;
    margin-vertical: ${theme.metrics.px(mv)}px;
    margin-right: ${theme.metrics.px(8)}px;
    height: ${theme.metrics.px(280)}px;
    width: ${theme.metrics.px(200)}px;
  `}
`;

export const Picture = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  priority: 'low',
  cachePolicy: 'memory-disk',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: ${theme.metrics.px(160)}px;
    border-top-left-radius: ${theme.metrics.px(8)}px;
    border-top-right-radius: ${theme.metrics.px(8)}px;
    background-color: ${theme.colors.grey600};
  `}
`;

export const PourLogo = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(30)}px;
    width: ${theme.metrics.px(30)}px;
    background-color: ${theme.colors.primary500};
    z-index: 1;
    position: absolute;
    top: ${theme.metrics.px(120)}px;
    right: ${theme.metrics.px(10)}px;
    border-radius: ${theme.metrics.px(20)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const TextContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    padding-horizontal: ${theme.metrics.px(12)}px;
    padding-vertical: ${theme.metrics.px(10)}px;
    justify-content: space-between;
  `}
`;

export const SubtitleSection = styled.View`
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

export const RatingContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(2)}px;
    align-items: center;
  `}
`;

export const BrandBadge = styled(Image).attrs({
  priority: 'low',
  cachePolicy: 'memory-disk',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(40)}px;
    height: ${theme.metrics.px(40)}px;
    position: absolute;
    top: ${theme.metrics.px(5)}px;
    left: ${theme.metrics.px(5)}px;
  `}
`;
