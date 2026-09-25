import { useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@theme';

type SkeletonProps = {
  width: DimensionValue;
  height: DimensionValue;
  radius?: number | 'square' | 'round' | undefined;
};

const Skeleton = ({ width, height, radius = 5 }: SkeletonProps) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const resolveBorderRadius = () => {
    if (radius === 'round') return 99999;
    if (radius === 'square') return 0;
    return radius;
  };

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: resolveBorderRadius(),
          backgroundColor: theme.colors.grey300,
        },
        animatedStyle,
      ]}
    />
  );
};

export { Skeleton };
