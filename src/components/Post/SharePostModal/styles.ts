import styled, { css, DefaultTheme } from 'styled-components/native';

export const Container = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding: ${theme.metrics.px(20)}px;
    gap: ${theme.metrics.px(20)}px;
  `}
`;

export const InputContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    min-height: ${theme.metrics.px(100)}px;
  `}
`;

export const PreviewContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.grey800};
    border-radius: ${theme.metrics.px(12)}px;
    padding: ${theme.metrics.px(12)}px;
    gap: ${theme.metrics.px(8)}px;
  `}
`;

export const PreviewHeader = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(8)}px;
    border-bottom-width: 1px;
    border-bottom-color: ${theme.colors.grey700};
  `}
`;

export const PreviewContent = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(8)}px;
  `}
`;

export const AuthorInfo = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(4)}px;
  `}
`;

export const ButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;

export const SubmitButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.primary500};
    padding: ${theme.metrics.px(16)}px;
    border-radius: ${theme.metrics.px(12)}px;
    align-items: center;
    justify-content: center;
  `}
`;
