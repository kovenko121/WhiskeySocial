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
    align-items: center;
    padding-horizontal: ${theme.metrics.px(24)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const PostsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const PostWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(16)}px;
  `}
`;

export const PinnedPostWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(8)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.primary500};
    border-radius: ${theme.metrics.px(8)}px;
    padding: ${theme.metrics.px(12)}px;
  `}
`;

export const Divider = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(1)}px;
    background-color: ${theme.colors.grey400};
    margin-vertical: ${theme.metrics.px(16)}px;
  `}
`;

export const EmptyContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-vertical: ${theme.metrics.px(40)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const EmptyText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    color: ${theme.colors.grey200};
    font-size: ${theme.metrics.px(14)}px;
    text-align: center;
    margin-top: ${theme.metrics.px(12)}px;
    line-height: ${theme.metrics.px(20)}px;
  `}
`;

export const LockContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-vertical: ${theme.metrics.px(40)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const LockText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    color: ${theme.colors.grey300};
    font-size: ${theme.metrics.px(14)}px;
    margin-top: ${theme.metrics.px(12)}px;
  `}
`;

export const LoadingContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-vertical: ${theme.metrics.px(24)}px;
    align-items: center;
  `}
`;

export const LoadMoreButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-vertical: ${theme.metrics.px(12)}px;
    align-items: center;
  `}
`;

export const LoadMoreText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    color: ${theme.colors.primary500};
    font-size: ${theme.metrics.px(14)}px;
    font-weight: 600;
  `}
`;
