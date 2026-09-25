import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const BottomButtonWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: row;
    margin-bottom: ${theme.metrics.px(55)}px;
    gap: ${theme.metrics.px(10)}px;
  `}
`;
