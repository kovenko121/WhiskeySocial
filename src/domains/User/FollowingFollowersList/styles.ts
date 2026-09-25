import { User } from '@types';
import { FlatList } from 'react-native';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: 100%;
    width: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    margin-top: ${theme.metrics.px(18)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const LoadingComponentView = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const FollowersFollowingList = styled(
  FlatList as typeof FlatList<User>
)``;

export const TabsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: flex-start;
    padding-horizontal: ${theme.metrics.px(24)}px;
    flex-direction: row;
    justify-content: center;
    gap: ${theme.metrics.px(60)}px;
    margin-vertical: ${theme.metrics.px(16)}px;
  `}
`;

export const TabContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    flex-direction: column;
    justify-content: flex-start;
    gap: ${theme.metrics.px(4)}px;
  `}
`;

export const ActiveIndicator = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    flex-direction: column;
    justify-content: center;
    background-color: ${theme.colors.primary500};
    height: ${theme.metrics.px(1)}px;
  `}
`;
