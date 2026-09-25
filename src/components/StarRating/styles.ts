import styled, { css, DefaultTheme } from 'styled-components/native';

export const StarContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(5)}px;
  `}
`;

export const Star = styled.TouchableOpacity``;
