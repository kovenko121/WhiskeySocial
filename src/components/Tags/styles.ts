import styled, { DefaultTheme, css } from 'styled-components/native';

export const TagsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    width: 100%;
    gap: ${theme.metrics.px(5)}px;
    flex-wrap: wrap;
  `}
`;

export const TagContainer = styled.View`
  ${({
    theme,
    selected = false,
    backgroundColor = 'primary',
    borderColor = 'primary500',
  }: {
    theme: DefaultTheme;
    selected: boolean;
    backgroundColor?: keyof DefaultTheme['colors'];
    borderColor?: keyof DefaultTheme['colors'];
  }) => css`
    display: flex;
    flex-direction: row;
    flex-shrink: 1;
    align-items: center;
    justify-content: center;
    background-color: ${selected
      ? theme.colors[backgroundColor]
      : theme.colors.transparent};
    height: ${theme.metrics.px(26)}px;
    min-width: ${theme.metrics.px(0)}px;
    border-width: 1px;
    border-radius: ${theme.metrics.px(37)}px;
    padding-horizontal: ${theme.metrics.px(10)}px;
    border-color: ${selected
      ? theme.colors[backgroundColor]
      : theme.colors[borderColor]};
  `}
`;

export const IconContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-right: ${theme.metrics.px(6)}px;
  `}
`;

export const CloseContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-left: ${theme.metrics.px(6)}px;
    padding: ${theme.metrics.px(2)}px;
    border-radius: ${theme.metrics.px(37)}px;
    background-color: ${theme.colors.white};
  `}
`;
