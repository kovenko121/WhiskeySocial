import styled, { css, DefaultTheme } from 'styled-components/native';

export const ButtonContainer = styled.View<{ noMargin?: boolean }>`
  ${({ theme, noMargin }: { theme: DefaultTheme; noMargin?: boolean }) => css`
    width: 100%;
    ${!noMargin && css`
      margin-top: ${theme.metrics.px(16)}px;
      margin-bottom: ${theme.metrics.px(8)}px;
    `}
  `}
`;
