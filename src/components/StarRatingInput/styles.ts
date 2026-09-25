import { ViewProps } from 'react-native';
import styled, { DefaultTheme, css } from 'styled-components/native';

export const StarInputContainer = styled.View<ViewProps & { mv: number }>`
  ${({ theme, mv }: { theme: DefaultTheme; mv: number }) => css`
    width: 100%;
    flex-direction: row;
    justify-content: center;
    margin-vertical: ${theme.metrics.px(mv)}px;
  `}
`;

export const Star = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-horizontal: ${theme.metrics.px(2)}px;
  `}
`;
