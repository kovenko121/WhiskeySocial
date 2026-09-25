import { Link as OriginalLink } from '@components';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const TitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const LinkContainer = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(8)}px;
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

export const NoLocationSpacing = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(10)}px;
  `}
`;

export const Link = styled(OriginalLink)`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(12)}px;
  `}
`;

export const IconContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(12)}px;
  `}
`;