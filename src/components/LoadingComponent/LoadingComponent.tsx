import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import AnimationBackground from '../../../assets/images/animation-background.png';
import AnimationCrown from '../../../assets/images/animation-crown.png';
import {
  ContentContainer,
  Crown,
  CrownWrapper,
  TransparencyView,
} from './styles';

const LoadingComponent = ({ duration = 4000 }: { duration?: number }) => {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(110);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
    zIndex: 2,
    position: 'absolute',
  }));

  useEffect(() => {
    if (duration > 0) {
      translationX.value = withTiming(100, { duration });

      translationY.value = withTiming(10, { duration });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <ContentContainer>
      <CrownWrapper>
        <Crown source={AnimationCrown} resizeMode="contain" />
      </CrownWrapper>
      {duration > 0 && (
        <Animated.Image source={AnimationBackground} style={animatedStyle} />
      )}

      <TransparencyView />
    </ContentContainer>
  );
};

export { LoadingComponent };
