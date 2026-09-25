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
    padding-bottom: ${theme.metrics.px(44)}px;
    justify-content: space-between;
  `}
`;

export const HeaderContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const TrackingInfoContainer = styled.View``;

export const RewardItemImage = styled(Image).attrs({
  placeholder: 'L04x*??G9E9E%%NHS69avwMx~X-:',
  cachePolicy: 'memory-disk',
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(100)}px;
    width: ${theme.metrics.px(100)}px;
    border-radius: ${theme.metrics.px(8)}px;
    margin-bottom: ${theme.metrics.px(14)}px;
  `}
`;

export const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const Column = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: column;
    gap: ${theme.metrics.px(12)}px;
  `}
`;

export const Divider = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 0.5px;
    background-color: ${theme.colors.secondary300};
    margin-top: ${theme.metrics.px(14)}px;
    margin-bottom: ${theme.metrics.px(14)}px;
  `}
`;

export const InfoRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    width: 100%;
    gap: ${theme.metrics.px(12)}px;
  `}
`;

export const ItemName = styled.View`
  width: 25%;
`;

export const ItemDescription = styled.View`
  width: 70%;
`;

export const AddressContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: column;
    gap: ${theme.metrics.px(20)}px;
    width: 65%;
    margin-bottom: ${theme.metrics.px(60)}px;
  `}
`;
