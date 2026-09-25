import styled, { css, DefaultTheme } from 'styled-components/native';

export const TitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: flex-end;
    width: 100%;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const EmptyMessageContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: flex-end;
    width: 100%;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const FlatList = styled.FlatList`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-left: ${theme.metrics.px(24)}px;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(40)}px;
    height: ${theme.metrics.px(20)}px;
  `}
`;
