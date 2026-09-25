import { useAuth } from '@contexts';
import { useSponsoredAd } from '@hooks';
import { track } from '@services';
import { useEffect } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../../Text/Text';
import { AdBody, AdContainer, AdImage } from './styles';
import { capturePostHogEvent } from '../../../config/posthog';

const LoadingAd = ({ visible }: { visible: boolean }) => {
  const { data: ad, isLoading } = useSponsoredAd();
  const {
    user: { sub },
  } = useAuth();

  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (isLoading || !ad || !visible) return;
    opacity.value = withDelay(500, withTiming(1, { duration: 350 }));
  });

  useEffect(() => {
    if (ad) {
      track('viewAd', { userId: sub, adName: ad?.name, adId: ad?.id });
      capturePostHogEvent('ad_viewed', { adName: ad?.name, adId: ad?.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad]);

  return (
    ad?.adPictureLoaded &&
    visible && (
      <AdContainer style={animatedStyle}>
        <Text>sponsored by</Text>
        <AdBody>
          <AdImage source={ad?.adPictureLoaded} />
        </AdBody>
      </AdContainer>
    )
  );
};

export { LoadingAd };
