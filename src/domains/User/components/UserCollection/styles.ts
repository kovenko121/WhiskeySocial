import { Link as OriginalLink } from '@components';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const MyCollectionDividerView = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    padding-vertical: ${theme.metrics.px(12)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
    align-items: center;
  `}
`;

export const IconButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(24)}px;
    width: ${theme.metrics.px(24)}px;
    align-items: flex-end;
    justify-content: center;
  `}
`;

export const HeaderControls = styled.View`
  ${() => css`
    flex-direction: row;
    align-items: center;
    gap: 10px;
  `}
`;

export const ViewListButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(4)}px;
    padding-vertical: ${theme.metrics.px(4)}px;
    padding-horizontal: ${theme.metrics.px(8)}px;
    border-radius: ${theme.metrics.px(12)}px;
    border-width: 1px;
    border-color: ${theme.colors.primary500};
  `}
`;

export const ViewListLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    color: ${theme.colors.primary500};
    font-size: ${theme.metrics.px(12)}px;
    font-weight: 600;
  `}
`;

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

export const ButtonWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    padding-horizontal: ${theme.metrics.px(24)}px;
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
