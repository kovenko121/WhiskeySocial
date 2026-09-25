import { Title } from '@components';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const HorizontalPadding = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    justify-content: space-between;
    flex-direction: column;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: ${theme.metrics.px(380)}px;
    margin-top: ${theme.metrics.px(18)}px;
    justify-content: flex-start;
  `}
`;

export const InputContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: ${theme.metrics.px(95)}px;
  `}
`;

export const TextContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme; half?: boolean }) => css`
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    gap: ${theme.metrics.px(8)}px;
    padding-bottom: ${theme.metrics.px(18)}px;
  `}
`;

export const Label = styled(Title)`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(18)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
    color: ${theme.colors.white};
    text-align: left;
  `}
`;

export const ButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.hp(29)}px;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const FormContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: ${theme.metrics.px(200)}px;
  `}
`;

export const HeaderConteiner = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;
