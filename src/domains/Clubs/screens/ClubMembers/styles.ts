import { FlatList } from 'react-native';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    padding-left: ${theme.metrics.px(24)}px;
    padding-right: ${theme.metrics.px(24)}px;
  `}
`;

export const MembersList = styled(FlatList)``;

export const SectionHeader = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-top: ${theme.metrics.px(12)}px;
    padding-bottom: ${theme.metrics.px(12)}px;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;

export const SectionHeaderText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(14)}px;
    font-weight: 600;
    color: ${theme.colors.grey200};
    text-transform: uppercase;
    letter-spacing: 1px;
  `}
`;

export const EmptyContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding-top: ${theme.metrics.px(48)}px;
    padding-bottom: ${theme.metrics.px(48)}px;
  `}
`;

export const EmptyText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(16)}px;
    color: ${theme.colors.grey200};
    margin-top: ${theme.metrics.px(16)}px;
  `}
`;

export const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const LockScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding-left: ${theme.metrics.px(32)}px;
    padding-right: ${theme.metrics.px(32)}px;
  `}
`;

export const LockScreenText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(16)}px;
    color: ${theme.colors.grey200};
    margin-top: ${theme.metrics.px(16)}px;
    text-align: center;
  `}
`;

export const FooterLoaderContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-top: ${theme.metrics.px(20)}px;
    padding-bottom: ${theme.metrics.px(20)}px;
  `}
`;
