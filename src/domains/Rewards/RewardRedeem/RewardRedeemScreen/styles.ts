import { Image } from 'expo-image';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    display: flex;
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    margin-top: ${theme.metrics.px(18)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
    justify-content: space-between;
  `}
`;

export const RedeemInfoColumn = styled.View`
  flex-direction: column;
  align-items: center;
`;

export const TitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    width: 100%;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;

export const SubtitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    width: 100%;

    margin-bottom: ${theme.metrics.px(16)}px;
  `}
`;

export const RewardItemImage = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  cachePolicy: 'memory-disk',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(220)}px;
    width: ${theme.metrics.px(220)}px;
    border-radius: ${theme.metrics.px(8)}px;
    margin-bottom: ${theme.metrics.px(14)}px;
    z-index: 10;
  `}
`;

export const RewardImageContainer = styled.View`
  align-items: center;
  width: 100%;
  justify-content: center;
`;

export const RewardPictureDecoration = styled.Image`
  position: absolute;
  z-index: 0;
`;
