import { Image } from 'expo-image';
import styled, { DefaultTheme, css } from 'styled-components/native';

type PicProps = {
  theme: DefaultTheme;
  size: 'large' | 'normal' | 'small' | 'x-small' | 'xx-small';
  border?: boolean;
  mt?: number;
  borderColor?: keyof DefaultTheme['colors'];
};

const sizes: { [key: string]: number } = {
  large: 108,
  normal: 56,
  small: 40,
  'x-small': 25,
  'xx-small': 18,
};

const iconSizes: { [key: string]: number } = {
  large: 28,
  normal: 14,
  small: 8,
  'x-small': 4,
};

export const PictureContainer = styled.View`
  ${({
    theme,
    absolute,
  }: {
    theme: DefaultTheme;
    absolute: number | null;
  }) => css`
    justify-content: center;
    align-items: center;
    position: ${absolute !== null ? 'absolute' : 'relative'};
    left: ${absolute !== null ? `${theme.metrics.px(absolute)}px` : 'auto'};
  `}
`;

export const PictureClick = styled.TouchableOpacity`
  ${({ theme, size, border }: PicProps) => css`
    width: ${theme.metrics.px(sizes[size] + (border ? 4 : 0))}px;
    height: ${theme.metrics.px(sizes[size] + (border ? 4 : 0))}px;
  `}
`;

export const PictureRound = styled.View`
  ${({ theme, size, border, mt, borderColor }: PicProps) => css`
    width: ${theme.metrics.px(sizes[size] + (border ? 4 : 0))}px;
    height: ${theme.metrics.px(sizes[size] + (border ? 4 : 0))}px;
    border-radius: 100px;
    overflow: hidden;
    border-width: ${theme.metrics.px(border ? 2 : 0)}px;
    border-color: ${borderColor || theme.colors.primary500};
    margin-top: ${theme.metrics.px(mt || 0)}px;
  `}
`;

export const Picture = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  cachePolicy: 'memory-disk',
  priority: 'high',
})`
  ${({ theme, size }: PicProps) => css`
    width: ${theme.metrics.px(sizes[size])}px;
    height: ${theme.metrics.px(sizes[size])}px;
    background-color: ${theme.colors.grey400};
  `}
`;

export const FallbackContainer = styled.View<{ size: PicProps['size'] }>`
  ${({ theme, size }: PicProps) => css`
    width: ${theme.metrics.px(sizes[size])}px;
    height: ${theme.metrics.px(sizes[size])}px;
    background-color: ${theme.colors.grey400};
    align-items: center;
    justify-content: center;
  `}
`;

export const IconContainer = styled.View`
  ${({ theme, size }: PicProps) => css`
    width: ${theme.metrics.px(iconSizes[size])}px;
    height: ${theme.metrics.px(iconSizes[size])}px;
    border-radius: 100px;
    overflow: hidden;
    background-color: ${theme.colors.primary500};
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 0;
    right: 0;
  `}
`;
