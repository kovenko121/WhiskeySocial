import { useEffect } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { DefaultTheme } from 'styled-components/native';
import { Progress, ProgressBar } from './styles';

const AnimatedProgressBar = ({
  progress,
  color,
}: {
  progress: number;
  color: keyof DefaultTheme['colors'];
}) => {
  const progressValue = useSharedValue(0);

  const reanimatedStyle = useAnimatedStyle(
    () => ({
      width: `${progressValue.value}%`,
    }),
    []
  );

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 3000 });
  }, [progress, progressValue]);

  return (
    <ProgressBar>
      <Progress color={color} style={[reanimatedStyle]} />
    </ProgressBar>
  );
};

export { AnimatedProgressBar };
