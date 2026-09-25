import styled, { css, DefaultTheme } from 'styled-components/native';

export const InputBarContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: flex-end;
    padding-horizontal: ${theme.metrics.px(12)}px;
    padding-vertical: ${theme.metrics.px(8)}px;
    border-top-width: ${theme.metrics.px(1)}px;
    border-top-color: ${theme.colors.grey400};
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const TextInputContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    margin-right: ${theme.metrics.px(8)}px;
  `}
`;

export const StyledTextInput = styled.TextInput`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.grey400};
    border-radius: ${theme.metrics.px(20)}px;
    padding-horizontal: ${theme.metrics.px(16)}px;
    padding-vertical: ${theme.metrics.px(10)}px;
    color: ${theme.colors.white};
    font-size: ${theme.metrics.px(14)}px;
    max-height: ${theme.metrics.px(100)}px;
  `}
`;

export const SendButton = styled.Pressable<{ disabled: boolean }>`
  ${({ theme, disabled }: { theme: DefaultTheme; disabled: boolean }) => css`
    width: ${theme.metrics.px(40)}px;
    height: ${theme.metrics.px(40)}px;
    border-radius: ${theme.metrics.px(20)}px;
    background-color: ${disabled ? theme.colors.grey400 : theme.colors.primary500};
    justify-content: center;
    align-items: center;
  `}
`;

export const CharCountContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: flex-end;
    padding-right: ${theme.metrics.px(56)}px;
    padding-vertical: ${theme.metrics.px(2)}px;
  `}
`;
