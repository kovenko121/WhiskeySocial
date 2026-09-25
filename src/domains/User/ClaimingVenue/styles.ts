import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const HeaderConteiner = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const FormContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    margin-vertical: ${theme.metrics.px(16)}px;
    justify-content: space-between;
    gap: ${theme.metrics.px(6)}px;
    padding-top: ${theme.metrics.px(10)}px;
  `}
`;

export const ButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(18)}px;
    padding-bottom: ${theme.metrics.px(28)}px;
  `}
`;

export const ConfirmContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-bottom: ${theme.metrics.px(12)}px;
  `}
`;
