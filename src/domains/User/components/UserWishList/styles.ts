import { Link as OriginalLink } from '@components';
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
    height: ${theme.metrics.px(345)}px;
    justify-content: center;
  `}
`;

export const HorizontalFlatList = styled.FlatList`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-left: ${theme.metrics.px(24)}px;
  `}
`;

export const Link = styled(OriginalLink)`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(10)}px;
  `}
`;

export const WhishlistDividerView = styled.View`
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
    margin-top: ${theme.metrics.px(10)}px;
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
