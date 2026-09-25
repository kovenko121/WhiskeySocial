import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const AdContainer = styled(Animated.View)`
  align-items: center;
`;

export const AdBody = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.wp(50)};
    height: ${theme.metrics.hp(15)};
    align-items: center;
  `}
`;

export const AdImage = styled(Image).attrs({
  cachePolicy: 'memory-disk',
  contentFit: 'contain',
})`
  height: 100%;
  width: 100%;
`;
