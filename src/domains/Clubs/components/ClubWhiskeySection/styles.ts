import styled, { css, DefaultTheme } from 'styled-components/native';

export const SectionContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(24)}px;
  `}
`;

export const SectionHeader = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    padding-vertical: ${theme.metrics.px(10)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
    align-items: center;
  `}
`;

export const IconButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(23)}px;
    width: ${theme.metrics.px(23)}px;
    align-items: flex-end;
    justify-content: center;
  `}
`;

export const DropDownSection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    padding-horizontal: ${theme.metrics.px(24)}px;
    align-items: center;
    padding-top: ${theme.metrics.px(10)}px;
    height: ${theme.metrics.px(50)}px;
    z-index: 1;
  `}
`;

export const HorizontalFlatList = styled.FlatList`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-left: ${theme.metrics.px(24)}px;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(44)}px;
    height: ${theme.metrics.px(20)}px;
  `}
`;

export const EmptyContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.wp(100) - theme.metrics.px(48)}px;
    height: ${theme.metrics.px(200)}px;
    justify-content: center;
    align-items: center;
  `}
`;

export const EmptyText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.grey300};
    text-align: center;
    margin-top: ${theme.metrics.px(12)}px;
  `}
`;

export const LockContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.wp(100) - theme.metrics.px(48)}px;
    height: ${theme.metrics.px(150)}px;
    justify-content: center;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const LockText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.grey300};
    text-align: center;
    margin-top: ${theme.metrics.px(12)}px;
  `}
`;
