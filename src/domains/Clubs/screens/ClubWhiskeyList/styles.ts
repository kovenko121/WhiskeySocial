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
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-top: ${theme.metrics.px(12)}px;
  `}
`;

export const HeaderRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-vertical: ${theme.metrics.px(12)}px;
  `}
`;

export const WhiskeysList = styled(FlatList)``;

export const EmptyContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding-vertical: ${theme.metrics.px(48)}px;
  `}
`;

export const EmptyText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(16)}px;
    color: ${theme.colors.grey200};
    margin-top: ${theme.metrics.px(16)}px;
    text-align: center;
  `}
`;

export const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const FooterLoaderContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-vertical: ${theme.metrics.px(20)}px;
  `}
`;
