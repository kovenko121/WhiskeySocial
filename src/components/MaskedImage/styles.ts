import styled, { css, DefaultTheme } from 'styled-components/native';
import { Image } from 'expo-image';

export const CircularImage = styled(Image)`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(19)}px;
    height: ${theme.metrics.px(19)}px;
    border-radius: ${theme.metrics.px(10)}px;
  `}
`;
