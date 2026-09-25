import styled, { css, DefaultTheme } from 'styled-components/native';

export const RadioGroupContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    margin-vertical: ${theme.metrics.px(4)}px;
    
  `};
`;

export const Label = styled.View`
  flex: 6;
`;