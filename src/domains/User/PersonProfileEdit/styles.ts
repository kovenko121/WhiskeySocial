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
    min-height: ${theme.metrics.px(600)}px;
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
  ${({ half = false }: { half?: boolean }) => css`
    width: ${half ? 47 : 100}%;
  `}
`;

export const ButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-vertical: ${theme.metrics.px(18)}px;
    padding-bottom: ${theme.metrics.px(28)}px;
  `}
`;

export const HalfInputContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;
