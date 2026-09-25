import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: space-between;
    margin-vertical: ${theme.metrics.px(30)}px;
  `}
`;

export const BottomButtonWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-vertical: ${theme.metrics.px(18)}px;
    padding-bottom: ${theme.metrics.px(28)}px;
    flex-direction: row;
    gap: ${theme.metrics.px(10)}px;
    flex: 1;
  `}
`;

export const ButtonWrapper = styled.View`
  flex: 1;
`;

export const FormContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    min-height: ${theme.metrics.px(165)}px;
    margin-vertical: ${theme.metrics.px(10)}px;
    justify-content: space-between;
    gap: ${theme.metrics.px(15)}px;
    padding-top: ${theme.metrics.px(10)}px;
  `}
`;

export const RadioGroupContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(18)}px;
  `}
`;
