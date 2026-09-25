import { Image, ImageProps } from 'expo-image';
import { ViewProps } from 'react-native';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const CardBody = styled.View<ViewProps & { mv: number; shadow: boolean; picWidth: number; border: boolean; small?: boolean; transparent?: boolean; backgroundColor?: keyof DefaultTheme['colors']; fixedHeight?: number }>`
  ${({
    theme,
    mv,
    shadow,
    picWidth,
    border = false,
    small = false,
    transparent = false,
    backgroundColor = 'grey400',
    fixedHeight,
  }) => css`
    display: flex;
    flex-direction: row;
    background-color: ${!transparent ? theme.colors[backgroundColor] : ''};
    border-radius: ${theme.metrics.px(8)}px;
    margin-vertical: ${theme.metrics.px(mv || 4)}px;
    margin-right: ${theme.metrics.px(5)}px;
    width: ${small ? theme.metrics.px(289) : theme.metrics.px(323)}px;
    margin-left: ${theme.metrics.px(3)}px;
    min-height: ${small
      ? theme.metrics.px(110)
      : theme.metrics.px(border ? picWidth + 4 : picWidth)}px;
    ${fixedHeight ? `height: ${theme.metrics.px(fixedHeight)}px;` : ''}
    ${shadow
      ? 'box-shadow:  2px 2px 4px #192333'
      : 'box-shadow:  2px 2px 4px transparent'};
    border-color: ${border
      ? theme.colors.primary500
      : theme.colors.transparent};
    border-width: ${theme.metrics.px(border ? 2 : 0)}px;
  `}
`;

export const Picture = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  cachePolicy: 'memory-disk',
  contentFit: 'cover',
})<ImageProps & { width: number }>`
  ${({ theme, width }) => css`
    border-bottom-left-radius: ${theme.metrics.px(8)}px;
    border-top-left-radius: ${theme.metrics.px(8)}px;
    background-color: ${theme.colors.grey600};
    width: ${theme.metrics.px(width)}px;
  `}
`;

export const MiniPicture = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  cachePolicy: 'memory-disk',
})<ImageProps & { width: number }>`
  ${({ theme, width }) => css`
    aspect-ratio: 1;
    border-radius: ${theme.metrics.px(10)}px;
    background-color: ${theme.colors.grey600};
    width: ${theme.metrics.px(width * 0.8)}px;
    margin-vertical: ${theme.metrics.px(10)}px;
    margin-horizontal: ${theme.metrics.px(10)}px;
  `}
`;

export const PlaceholderPicture = styled.View<{ width: number }>`
  ${({ theme, width }) => css`
    border-bottom-left-radius: ${theme.metrics.px(8)}px;
    border-top-left-radius: ${theme.metrics.px(8)}px;
    background-color: ${theme.colors.grey600};
    width: ${theme.metrics.px(width)}px;
    align-self: stretch;
  `}
`;

export const BrandBadge = styled(Image).attrs({
  priority: 'low',
  cachePolicy: 'memory-disk',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(30)}px;
    height: ${theme.metrics.px(30)}px;
    position: absolute;
    top: ${theme.metrics.px(5)}px;
    left: ${theme.metrics.px(5)}px;
    z-index: 1;
  `}
`;

export const PourLogo = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(30)}px;
    width: ${theme.metrics.px(30)}px;
    background-color: ${theme.colors.primary500};
    z-index: 1;
    position: absolute;
    bottom: ${theme.metrics.px(5)}px;
    left: ${theme.metrics.px(85)}px;
    border-radius: ${theme.metrics.px(20)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const TextContainer = styled.View<ViewProps & { pv?: number; ph?: number }>`
  ${({
    theme,
    pv = 8,
    ph = 18,
  }) => css`
    flex: 1;
    padding-horizontal: ${theme.metrics.px(ph)}px;
    padding-vertical: ${theme.metrics.px(pv)}px;
    justify-content: space-between;
  `}
`;

export const CardMenu = styled.View<ViewProps & { pv: number; ph: number }>`
  ${({ theme, pv, ph }) => css`
    padding-vertical: ${theme.metrics.px(pv)}px;
    padding-horizontal: ${theme.metrics.px(ph)}px;
  `}
`;

export const ChildrenSection = styled.View`
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

export const CardStackAnchor = styled.View<ViewProps & { mv: number }>`
  ${({ theme, mv }) => css`
    z-index: -1;
    margin-vertical: ${theme.metrics.px(mv || 4)}px;
  `}
`;

export const CardStack = styled.View<ViewProps & { border: boolean; shadow: boolean; small?: boolean; transparent?: boolean; backgroundColor?: keyof DefaultTheme['colors'] }>`
  ${({
    theme,
    border = false,
    shadow = false,
    small = false,
    backgroundColor = 'grey400',
  }) => css`
    position: absolute;
    bottom: ${theme.metrics.px(0)}px;
    left: ${theme.metrics.px(3)}px;
    background-color: ${theme.colors[backgroundColor]};
    border-radius: ${theme.metrics.px(8)}px;
    width: ${small ? theme.metrics.px(289) : theme.metrics.px(323)}px;
    height: ${theme.metrics.px(20)};
    border-color: ${border
      ? theme.colors.primary500
      : theme.colors.transparent};
    border-width: ${theme.metrics.px(border ? 2 : 0)}px;
    ${shadow
      ? 'box-shadow:  2px 2px 4px #192333'
      : 'box-shadow:  2px 2px 4px transparent'};
  `}
`;

export const CupWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(2)}px;
  `}
`;

export const RatingContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(4)}px;
    padding-bottom: ${theme.metrics.px(4)}px;
    padding-left: ${theme.metrics.px(4)}px;
  `}
`;

export const ProofWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme; width?: number }) => css`
    width: ${theme.metrics.px(110)}px;
  `}
`;

export const TitleContainer = styled.View`
  ${() => css`
    flex-direction: column;
  `}
`;

export const DeleteButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(26)}px;
    height: ${theme.metrics.px(26)}px;
    border-radius: 100px;
    align-items: center;
    justify-content: center;
    background-color: ${theme.colors.primary500};
    top: ${theme.metrics.px(-10)}px;
    right: ${theme.metrics.px(-16)}px;
    position: absolute;
  `}
`;

export const DeleteButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: flex-end;
    margin-horizontal: ${theme.metrics.px(8)}px;
  `}
`;

export const AddToWishListButtonContainer = styled.View`
  align-items: center;
  justify-content: center;
`;

export const AddToWishlistButton = styled.TouchableOpacity`
  ${({
    theme,
    color = 'primary500',
  }: {
    theme: DefaultTheme;
    color?: string;
  }) => css`
    width: ${theme.metrics.px(26)}px;
    height: ${theme.metrics.px(26)}px;
    border-radius: 100px;
    align-items: center;
    justify-content: center;
    background-color: ${color};
  `}
`;

export const Row = styled.View`
  flex-direction: row;
`;

export const TitleWrapper = styled.View<ViewProps & { width?: number }>`
  ${({ theme, width = 145 }) => css`
    width: ${theme.metrics.px(width)}px;
  `}
`;

export const IconWrapper = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-left: ${theme.metrics.px(10)}px;
    margin-top: ${theme.metrics.px(6)}px;
  `}
`;

export const CheckinContainer = styled.View`
  ${() => css`
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    gap: 30%;
  `}
`;

export const VerifyContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(6)}px;
    flex: 1;
  `}
`;

export const CrownContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(6)}px;
    align-items: center;
  `}
`;
