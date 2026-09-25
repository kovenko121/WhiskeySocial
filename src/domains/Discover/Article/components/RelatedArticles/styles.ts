import styled, { css, DefaultTheme } from 'styled-components/native';

export const TitleContainer = styled.View`
   flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 44px;
    height: ${theme.metrics.px(50)}px;
  `}
`;

export const EmptyPostList = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.wp(100) - theme.metrics.px(48)}px;
  `}
`;

export const HorizontalFlatList = styled.FlatList``;
