import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    display: flex;
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    margin-top: ${theme.metrics.px(18)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
    flex-direction: column;
    justify-content: space-between;
  `}
`;

export const TitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    width: 100%;
    margin-bottom: ${theme.metrics.px(40)}px;
  `}
`;

export const InfoRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    width: 100%;
    gap: ${theme.metrics.px(12)}px;
  `}
`;

export const ItemName = styled.View`
  width: 25%;
`;

export const ItemDescription = styled.View`
  width: 70%;
`;

export const ItemsContainer = styled.View`
  height: 65%;
`;

export const Divider = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 0.5px;
    background-color: ${theme.colors.secondary300};
    margin-top: ${theme.metrics.px(14)}px;
    margin-bottom: ${theme.metrics.px(14)}px;
  `}
`;

export const ButtonsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(14)}px;
    margin-bottom: ${theme.metrics.px(46)}px;
  `}
`;

export const ErrorMessageContainer = styled.View`
  width: 100%;
  justify-content: center;
  align-items: center;
`;
