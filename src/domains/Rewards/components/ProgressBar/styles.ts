import Animated from 'react-native-reanimated';
import styled, { DefaultTheme, css } from 'styled-components/native';

export const ProgressBar = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    background-color: ${theme.colors.grey300};
    height: 3px;
    margin-bottom: ${theme.metrics.px(18)}px;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;

export const Progress = styled(Animated.View)`
  ${({
    theme,
    color = 'primary',
  }: {
    theme: DefaultTheme;
    color?: keyof DefaultTheme['colors'];
  }) => css`
    background-color: ${theme?.colors[color]};
    height: 3px;
  `}
`;
