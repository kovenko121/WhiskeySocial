import { Image } from 'expo-image';
import styled, { DefaultTheme, css } from 'styled-components/native';

export const RewardCard = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-right: ${theme.metrics.px(24)}px;
    height: ${theme.metrics.hp(73)}px;
    width: ${theme.metrics.px(250)}px;
    align-items: flex-start;
    flex-direction: column;
  `}
`;

export const RewardItemImage = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  cachePolicy: 'memory-disk',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    justify-content: center;
    height: ${theme.metrics.hp(30.7)}px;
    width: ${theme.metrics.px(250)}px;
    border-radius: ${theme.metrics.px(8)}px;
    margin-bottom: ${theme.metrics.px(14)}px;
  `}
`;

export const RewardImageCover = styled.View`
  ${({
    theme,
    available,
    color = 'grey300',
  }: {
    theme: DefaultTheme;
    available?: boolean;
    color?: keyof DefaultTheme['colors'];
  }) => css`
    border-radius: ${theme.metrics.px(8)}px;
    height: ${theme.metrics.px(250)}px;
    width: ${theme.metrics.px(250)}px;
    align-items: center;
    justify-content: center;
    background-color: ${!available
      ? theme.colors[color]
      : theme.colors.transparent};
    opacity: ${available ? 1 : 0.7};
    position: absolute;
  `}
`;

export const RewardList = styled.FlatList``;

export const RewardStatusContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(108)}px;
    margin-bottom: ${theme.metrics.px(10)}px;
  `}
`;

export const ProgressRow = styled.View`
  flex-direction: row;
`;

export const Row = styled.View`
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
`;

export const ButtonContainer = styled.View`
  width: 100%;
`;

export const RewardInforContainer = styled.View`
  height: 37%;
  justify-content: space-between;
  width: 100%;
  flex-direction: column;
`;

export const DescriptionContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 40%;
    margin-top: ${theme.metrics.px(10)}px;
  `}
`;
