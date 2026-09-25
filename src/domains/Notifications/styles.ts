import { Image } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';

type PicProps = {
  theme: DefaultTheme;
  size: 'large' | 'normal' | 'small' | 'x-small';
  border?: boolean;
  mt?: number;
};

const sizes: { [key: string]: number } = {
  large: 108,
  normal: 56,
  small: 40,
  'x-small': 25,
};

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    justify-content: flex-start;
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.metrics.px(12)}px;
    flex: 1;
    margin-top: ${theme.metrics.px(18)}px;
  `}
`;

export const ScreenPadding = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const IconContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(60)}px;
    height: ${theme.metrics.px(170)}px;
    width: 100%;
    justify-content: center;
    align-items: center;
  `}
`;

export const ListContainer = styled.View`
  flex: 1;
  width: 100%;
`;

export const InputContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    flex-direction: column;
    justify-content: center;
    min-height: ${theme.metrics.px(60)}px;
  `}
`;

export const SearchContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: row;
    min-height: ${theme.metrics.px(60)}px;
  `}
`;

export const Loading = styled.ActivityIndicator.attrs(({ theme }: { theme: DefaultTheme }) => ({
  color: theme.colors.primary,
}))`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(4)}px;
  `}
`;

export const IconButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-right: ${theme.metrics.px(12)}px;
    padding-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const SearchTypeBar = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.metrics.px(18)}px;
  `}
`;

export const SearchTypeText = styled.Text.attrs({
  allowFontScaling: false,
})`
  ${({ theme, disabled }: { theme: DefaultTheme; disabled?: boolean }) => css`
    font-family: ${theme?.fonts.bold};
    font-size: ${theme?.metrics.px(14)}px;
    color: ${disabled ? theme?.colors.grey300 : theme.colors.white};
  `}
`;

export const SearchTypeButton = styled.TouchableOpacity`
  ${({ theme, selected }: { theme: DefaultTheme; selected?: boolean }) => css`
    border-bottom-width: ${theme.metrics.px(selected ? 1 : 0)}px;
    border-bottom-color: ${theme.colors.primary};
    padding-vertical: ${theme.metrics.px(4)}px;
  `}
`;

export const LinkButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: row;
    padding-vertical: ${theme.metrics.px(4)}px;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.hp(10)}px;
  `}
`;

export const PictureRound = styled.View`
  ${({ theme, size, border, mt }: PicProps) => css`
    width: ${theme.metrics.px(sizes[size] + (border ? 4 : 0))}px;
    height: ${theme.metrics.px(sizes[size] + (border ? 4 : 0))}px;
    border-radius: 100px;
    overflow: hidden;
    border-width: ${theme.metrics.px(border ? 2 : 0)}px;
    border-color: ${theme.colors.primary500};
    margin-top: ${theme.metrics.px(mt || 0)}px;
  `}
`;

export const Picture = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  cachePolicy: 'memory-disk',
})`
  ${({ theme, width }: { theme: DefaultTheme; width: number }) => css`
    aspect-ratio: 1;
    border-bottom-left-radius: ${theme.metrics.px(10)}px;
    border-top-left-radius: ${theme.metrics.px(10)}px;
    background-color: ${theme.colors.grey600};
    width: ${theme.metrics.px(width)}px;
  `}
`;

export const PictureContainer = styled.View`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

export const PicturePlaceholder = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(40)}px;
    height: ${theme.metrics.px(40)}px;
    border-radius: 100px;
    background-color: ${theme.colors.grey600};
    justify-content: center;
    align-items: center;
    margin-top: ${theme.metrics.px(16)}px;
  `}
`;
