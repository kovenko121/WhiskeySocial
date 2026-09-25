import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    justify-content: flex-start;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentContainer = styled.SafeAreaView`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    margin-top: ${theme.metrics.px(40)}px;
  `}
`;

export const Column = styled.View`
  flex-direction: column;
`;

export const TitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(80)}px;
    justify-content: space-between;
  `}
`;

export const FormContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-top: ${theme.metrics.px(24)}px;
  `}
`;

export const InputContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    min-height: ${theme.metrics.px(100)}px;
  `}
`;

export const BottomButtonWrapper = styled.View`
    ${({ theme }: { theme: DefaultTheme }) => css`
    margin-vertical: ${theme.metrics.px(18)}px;
    padding-bottom: ${theme.metrics.px(28)}px;
  `}
`;