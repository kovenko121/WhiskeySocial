import { Image } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const AdBody = styled.View`
  width: 100%;
`;

export const ImageContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    max-height: ${theme.metrics.px(328)};
    width: 100%;
    margin-top: ${theme.metrics.px(6)};
  `}
`;

export const AdImage = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  cachePolicy: 'memory-disk',
  contentFit: 'cover',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: 100%;
    width: 100%;
    border-top-left-radius: ${theme.metrics.px(16)}px;
    border-top-right-radius: ${theme.metrics.px(16)}px;
    background-color: ${theme.colors.grey200};
  `}
`;

export const BottomContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(35)}px;
    width: 100%;
    background-color: ${theme.colors.primary};
    border-bottom-left-radius: ${theme.metrics.px(16)}px;
    border-bottom-right-radius: ${theme.metrics.px(16)}px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(20)}px;
    margin-bottom: ${theme.metrics.px(6)}px;
  `}
`;

export const TagContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: absolute;
    z-index: 1;
    top: ${theme.metrics.px(15)}px;
    left: ${theme.metrics.px(15)}px;
  `}
`;
