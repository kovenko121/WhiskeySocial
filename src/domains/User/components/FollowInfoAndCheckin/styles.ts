import styled, { css, DefaultTheme } from 'styled-components/native';

export const StatusWrapper = styled.View`
  ${({ theme, ph }: { theme: DefaultTheme; ph: number }) => css`
    flex-direction: row;
    justify-content: center;
    gap: ${theme.metrics.px(18)}px;
    width: 100%;
    margin-top: ${theme.metrics.px(20)}px;
    margin-bottom: ${theme.metrics.px(10)}px;
    padding-horizontal: ${theme.metrics.px(ph)}px;
  `}
`;

export const RewardIconContainer = styled.Image`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(20)}px;
    height: ${theme.metrics.px(28)}px;
  `}
`;
