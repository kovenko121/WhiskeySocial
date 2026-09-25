import styled, { css, DefaultTheme } from 'styled-components/native';

export const Container = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    background-color: ${theme.colors.grey400};
    padding-horizontal: ${theme.metrics.px(12)}px;
    padding-vertical: ${theme.metrics.px(6)}px;
    border-radius: ${theme.metrics.px(4)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const PinnedText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(11)}px;
    font-weight: 700;
    color: ${theme.colors.primary500};
    text-transform: uppercase;
    margin-left: ${theme.metrics.px(6)}px;
    letter-spacing: 0.5px;
  `}
`;
