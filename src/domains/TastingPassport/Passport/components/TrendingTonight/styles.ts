import styled, { css, DefaultTheme } from 'styled-components/native';

export const Container = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(20)}px;
  `}
`;

export const Header = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;

// 8px between the ranked cards, per design.
export const Rows = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(8)}px;
  `}
`;

export const Label = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(11)}px;
    letter-spacing: 0.5px;
    color: ${theme.colors.grey200};
  `}
`;

// Placeholder card that holds the section's shape before the first pour lands.
export const EmptyCard = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    justify-content: center;
    padding-vertical: ${theme.metrics.px(20)}px;
    padding-horizontal: ${theme.metrics.px(16)}px;
    /* Matches the ranked cards it stands in for. */
    border-radius: ${theme.metrics.px(10)}px;
    background-color: ${theme.colors.grey400};
  `}
`;

export const EmptyText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(13)}px;
    line-height: ${theme.metrics.px(18)}px;
    text-align: center;
    color: ${theme.colors.grey200};
  `}
`;

export const Link = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(12)}px;
    color: ${theme.colors.primary500};
  `}
`;
