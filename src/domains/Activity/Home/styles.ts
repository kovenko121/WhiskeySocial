import styled, { css, DefaultTheme } from 'styled-components/native';
import { isAndroid } from '@helpers';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(10)}px;
  `}
`;

export const SafeAreaView = styled.SafeAreaView`
  flex: 1;
`;

export const Divider = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-vertical: ${theme.metrics.px(16)}px;
    background-color: ${theme.colors.grey400};
    width: 100%;
    height: ${theme.metrics.px(1)}px;
  `}
`;

export const EmptyPostList = styled.View`
  width: 100%;
  height: 100%;
  justify-content: center;
`;

export const GuestInvite = styled.View`
  flex: 1;
  justify-content: center;
`;

export const HeaderWrapper = styled.View`
  ${isAndroid &&
  css`
    padding-top: ${({ theme }: { theme: DefaultTheme }) => theme.metrics.hp(7)}px;
  `}
`;
