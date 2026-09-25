import Animated from 'react-native-reanimated';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const TipDialogContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    width: 70%;
    border-radius: ${theme.metrics.px(8)}px;
    padding-vertical: ${theme.metrics.px(6)}px;
    padding-horizontal: ${theme.metrics.px(6)}px;
    background-color: ${theme.colors.grey300};
    left: ${theme.metrics.px(50)}px;
    top: 0;
    z-index: 10;
  `}
`;

export const TextContainer = styled.View`
  width: 75%;
`;

export const IconContainer = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
`;

export const Tail = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: ${theme.metrics.px(10)}px;
    height: ${theme.metrics.px(10)}px;
    background-color: ${theme.colors.grey300};
    transform: rotate(45deg);
    position: absolute;
    bottom: -6;
    left: ${theme.metrics.px(30)}px;
  `}
`;

export const AnimatedView = styled(Animated.View)`
  ${() => css`
    z-index: 10;
  `}
`;
