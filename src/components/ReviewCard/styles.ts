import { Image } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const ReviewBody = styled.View`
  ${({
    theme,
    backgroundColor,
  }: {
    theme: DefaultTheme;
    backgroundColor?: String;
  }) => css`
    background-color: ${theme.colors.grey400};
    border-radius: ${theme.metrics.px(10)}px;
    border-width: ${theme.metrics.px(2)}px;
    border-color: ${theme.colors.grey400};
    background-color: ${theme.colors[backgroundColor]};
    padding: ${theme.metrics.px(16)}px;
    width: 100%;
    gap: ${theme.metrics.px(12)}px;
    margin-bottom: ${theme.metrics.px(20)}px;
  `}
`;

export const AuthorSection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(10)}px;
  `}
`;

export const SectionTitleWrapper = styled.View`
  flex: 1;
`;

export const PictureContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(20)}px;
    width: ${theme.metrics.px(20)}px;
  `}
`;

export const Picture = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  cachePolicy: 'memory-disk',
  contentFit: 'cover',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: 100%;
    width: 100%;
    border-radius: ${theme.metrics.px(30)}px;
  `}
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
