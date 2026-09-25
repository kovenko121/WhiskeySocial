import { useAuth } from '@contexts';
import { useAdsByType } from '@hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { track } from '@services';
import { AdCampaign, AdType, ImageUrl, S3Object } from '@types';
import { useCallback, useEffect, useState } from 'react';
import { ImageSourcePropType, Linking, TouchableOpacity } from 'react-native';
import { capturePostHogEvent } from '../../../config/posthog';
import { useOpenPassport } from '../../../domains/TastingPassport/data/useOpenPassport';
import { getPassportEventId, getS3Image, getTestId } from '../../../helpers';
import { Divider } from '../../Divider/Divider';
import { Icon } from '../../Icon/Icon';
import { Tag } from '../../Tags/Tags';
import { Text } from '../../Text/Text';
import {
  AdBody,
  AdImage,
  BottomContainer,
  ImageContainer,
  TagContainer,
} from './styles';

const Ad = ({
  type,
  topDivider,
  bottomDivider,
}: {
  type: AdType;
  topDivider?: boolean;
  bottomDivider?: boolean;
}) => {
  const { data } = useAdsByType(type);
  const activeAds = data?.items.filter((item: any) => item.isActive);
  const [currentAd, setCurrentAd] = useState<AdCampaign>();
  const {
    user: { sub },
  } = useAuth();
  const openPassport = useOpenPassport();

  const getAdIndex = () => {
    (async () => {
      if (!activeAds?.length) return;

      const adIndex = await AsyncStorage.getItem(type);
      if (!adIndex || parseInt(adIndex, 10) > activeAds.length - 1) {
        setCurrentAd(activeAds[0]);
        await AsyncStorage.setItem(type, '1');
        return;
      }
      if (adIndex && parseInt(adIndex, 10) < activeAds.length) {
        setCurrentAd(activeAds[parseInt(adIndex, 10)]);
        await AsyncStorage.setItem(
          type,
          (parseInt(adIndex, 10) + 1).toString()
        );
      }
    })();
  };

  useEffect(() => {
    if (currentAd) {
      track('viewAd', {
        userId: sub,
        adName: currentAd?.name,
        adId: currentAd?.id,
      });
      capturePostHogEvent('ad_viewed', {
        adName: currentAd?.name,
        adId: currentAd?.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAd]);

  useFocusEffect(
    useCallback(() => {
      getAdIndex();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])
  );

  const [adPicture, setAdPicture] = useState<ImageUrl | ImageSourcePropType>();

  useEffect(() => {
    const getAdPicture = async (pic: S3Object) => {
      const img = await getS3Image(pic);
      if (img) setAdPicture(img);
    };

    if (currentAd?.picture?.key) {
      getAdPicture(currentAd?.picture);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAd?.id]);

  return (
    currentAd &&
    currentAd?.url && (
      <AdBody>
        {topDivider && <Divider />}
        <TouchableOpacity
          testID={getTestId('ads')}
          onPress={() => {
            const adUrl = currentAd?.url;
            if (!adUrl) return;

            track('clickAd', {
              userId: sub,
              adName: currentAd?.name,
              adId: currentAd?.id,
            });
            capturePostHogEvent('ad_clicked', {
              adName: currentAd?.name,
              adId: currentAd?.id,
            });

            const passportEventId = getPassportEventId(adUrl);
            if (passportEventId) {
              openPassport(passportEventId);
              return;
            }

            Linking.openURL(adUrl);
          }}
        >
          <ImageContainer>
            <TagContainer>
              <Tag text="Ads" selected />
            </TagContainer>
            <AdImage source={adPicture} contentFit="cover" />
          </ImageContainer>
          <BottomContainer>
            <Text bold>See more</Text>
            <Icon name="right" size={13} color="white" />
          </BottomContainer>
        </TouchableOpacity>
        {bottomDivider && <Divider />}
      </AdBody>
    )
  );
};

export { Ad };
