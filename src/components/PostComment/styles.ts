import styled, { css, DefaultTheme } from 'styled-components/native';

export const ContentContainer = styled.Pressable`
  ${({
    theme,
    highlight = false,
  }: {
    theme: DefaultTheme;
    highlight?: boolean;
  }) => css`
    flex-direction: row;
    width: 85%;
    background-color: ${highlight
      ? theme.colors.grey300
      : theme.colors.transparent};
    border-radius: ${theme.metrics.px(8)}px;
    padding-horizontal: ${theme.metrics.px(6)}px;
    padding-vertical: ${theme.metrics.px(6)}px;
  `}
`;

export const PictureContainer = styled.View`
  width: 10%;
`;

export const CommentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-right: ${theme.metrics.px(30)}px;
  `}
`;

export const AuthorContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    padding-horizontal: ${theme.metrics.px(6)}px;
    align-items: baseline;
    margin-bottom: ${theme.metrics.px(6)}px;
  `}
`;

export const TextContainer = styled.View`
  overflow-wrap: break-word;
`;

export const Content = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    padding-left: ${theme.metrics.px(6)}px;
    align-items: flex-start;
    justify-content: space-between;
  `}
`;

export const ActivityIndicatorContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(50)}px;
  `}
`;

export const IconContainer = styled.View`
  ${({ theme, red = false }: { theme: DefaultTheme; red?: boolean }) => css`
    height: ${theme.metrics.px(24)}px;
    width: ${theme.metrics.px(24)}px;
    background-color: ${red ? theme.colors.red : theme.colors.transparent};
    align-items: center;
    justify-content: center;
    border-radius: ${theme.metrics.px(50)}px;
  `}
`;
