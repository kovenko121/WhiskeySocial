import styled, { css, DefaultTheme } from 'styled-components/native';

export const SadContainer = styled.View`
  ${({ theme, mb, marginRight }: { theme: DefaultTheme; mb: number }) => css`
    margin-top: ${theme.metrics.px(0)}px;
    margin-bottom: ${theme.metrics.px(mb)}px;
    width: ${marginRight ? '93%' : '100%'};
    align-items: center;
    justify-content: center;
    gap: ${theme.metrics.px(10)}px;
  `}
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;
