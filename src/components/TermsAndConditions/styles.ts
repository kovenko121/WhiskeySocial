import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScrollView = styled.ScrollView`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(18)}px;
    width: 100%;
  `}
`;
