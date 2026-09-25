import styled, { DefaultTheme, css } from 'styled-components/native';

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

export const PictureContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(40)}px;
  `};
`;

export const FormContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    margin-vertical: ${theme.metrics.px(16)}px;
    justify-content: space-between;
    gap: ${theme.metrics.px(15)}px;
    padding-top: ${theme.metrics.px(10)}px;
  `}
`;

export const InputContainer = styled.View`
  ${({ theme, half = false }: { theme: DefaultTheme; half?: boolean }) => css`
    width: ${half ? 47 : 100}%;
    justify-content: flex-start;
    align-items: flex-start;
    margin: ${theme.metrics.px(8)}px 0 0;
  `}
`;

export const ButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(18)}px;
    padding-bottom: ${theme.metrics.px(28)}px;
  `}
`;
