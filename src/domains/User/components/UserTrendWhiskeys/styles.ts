import styled, { css, DefaultTheme } from 'styled-components/native';

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 44px;
    height: ${theme.metrics.px(20)}px;
  `}
`;

export const EmptyPostList = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.wp(100) - theme.metrics.px(48)}px;
  `}
`;

export const HorizontalFlatList = styled.FlatList`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-left: ${theme.metrics.px(24)}px;
  `}
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  padding-top: ${({ theme }: { theme: DefaultTheme }) => theme.metrics.px(12)}px;
`;
