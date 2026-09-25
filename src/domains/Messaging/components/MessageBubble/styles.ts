import styled, { css, DefaultTheme } from 'styled-components/native';

export const BubbleRow = styled.View<{ isOwn: boolean }>`
  ${({ theme, isOwn }: { theme: DefaultTheme; isOwn: boolean }) => css`
    flex-direction: row;
    justify-content: ${isOwn ? 'flex-end' : 'flex-start'};
    padding-horizontal: ${theme.metrics.px(16)}px;
    margin-vertical: ${theme.metrics.px(4)}px;
  `}
`;

export const BubbleContainer = styled.View<{ isOwn: boolean }>`
  ${({ theme, isOwn }: { theme: DefaultTheme; isOwn: boolean }) => css`
    max-width: 75%;
    padding-vertical: ${theme.metrics.px(10)}px;
    padding-horizontal: ${theme.metrics.px(14)}px;
    border-radius: ${theme.metrics.px(16)}px;
    background-color: ${isOwn ? theme.colors.primary500 : theme.colors.grey400};
    ${isOwn
      ? css`
          border-bottom-right-radius: ${theme.metrics.px(4)}px;
        `
      : css`
          border-bottom-left-radius: ${theme.metrics.px(4)}px;
        `}
  `}
`;

export const DeletedBubbleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    max-width: 75%;
    padding-vertical: ${theme.metrics.px(10)}px;
    padding-horizontal: ${theme.metrics.px(14)}px;
    border-radius: ${theme.metrics.px(16)}px;
    background-color: ${theme.colors.grey400};
    opacity: 0.6;
  `}
`;

export const TimestampContainer = styled.View<{ isOwn: boolean }>`
  ${({ theme, isOwn }: { theme: DefaultTheme; isOwn: boolean }) => css`
    flex-direction: row;
    justify-content: ${isOwn ? 'flex-end' : 'flex-start'};
    align-items: center;
    padding-horizontal: ${theme.metrics.px(16)}px;
    margin-bottom: ${theme.metrics.px(2)}px;
    gap: ${theme.metrics.px(4)}px;
  `}
`;
