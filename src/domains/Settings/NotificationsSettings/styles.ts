import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentContainer = styled.ScrollView`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    margin-top: ${theme.metrics.px(20)}px;
    margin-horizontal: -${theme.metrics.px(24)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const GeneralContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    margin-vertical: ${theme.metrics.px(10)}px;
  `};
`;

export const Label = styled.View`
  flex: 6;
`;

export const NotificationContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    flex-direction: column;
    justify-content: space-around;
    align-items: flex-end;
    min-width: ${theme.metrics.px(100)}px;
  `};
`;

export const ButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-vertical: ${theme.metrics.px(18)}px;
    padding-bottom: ${theme.metrics.px(28)}px;
  `}
`;
