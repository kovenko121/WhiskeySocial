import styled, { css, DefaultTheme } from 'styled-components/native';

export const SeparatorContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(24)}px;
    margin-vertical: ${theme.metrics.px(12)}px;
  `}
`;

export const SeparatorLine = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    height: ${theme.metrics.px(1)}px;
    background-color: ${theme.colors.grey400};
  `}
`;

export const SeparatorTextContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(12)}px;
  `}
`;
