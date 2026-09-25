import React, { useEffect, useState } from 'react';
import { capitalize, getFullWhiskeyName, getS3Image } from '@helpers';
import { theme } from '@theme';
import type { ImageUrl, Whiskey } from '@types';
import { S3Object } from '@types';
import type { ImageSourcePropType } from 'react-native';
import { CrownIcon } from '../../CrownIcon/CrownIcon';
import { Icon } from '../../Icon/Icon';
import { MaskedImage } from '../../MaskedImage/MaskedImage';
import { Skeleton } from '../../Skeleton/Skeleton';
import { Tag } from '../../Tags/Tags';
import { SectionTitle, Text } from '../../Text/Text';
import {
  BrandBadge,
  CardBody,
  Picture,
  PourLogo,
  RatingContainer,
  SubtitleSection,
  TextContainer,
} from './styles';

export const VerticalCard = React.memo(({
  image,
  children,
  mv = 16,
  onPress,
  brand,
  backgoundColor = 'grey400',
  pour = false,
}: {
  image?: S3Object | ImageSourcePropType | any;
  brand?: S3Object | ImageSourcePropType | any;
  children: React.JSX.Element;
  mv?: number;
  backgoundColor?: keyof typeof theme.colors;
  onPress?: () => void;
  pour?: boolean;
}) => {
  const [background, setBackground] = useState<
    ImageUrl | ImageSourcePropType
  >();
  const [brandImage, setBrandImage] = useState<
    ImageUrl | ImageSourcePropType
  >();

  useEffect(() => {
    const setWhiskeyImg = async (pic: S3Object) => {
      const img = await getS3Image(pic);
      if (img) setBackground(img);
    };

    if (image?.bucket) {
      setWhiskeyImg(image);
    }
  }, [image]);

  useEffect(() => {
    const setBrandImg = async (pic: S3Object) => {
      const img = await getS3Image(pic);
      if (img) setBrandImage(img);
    };

    if (brand?.bucket) {
      setBrandImg(brand);
    }
  }, [brand]);

  return (
    <CardBody mv={mv} onPress={onPress} backgoundColor={backgoundColor}>
      {background ? (
        <Picture source={background} />
      ) : (
        <Skeleton width="100%" height={180} radius={10} />
      )}
      {pour && (
        <PourLogo>
          <Icon name="pour" size={20} color="white" />
        </PourLogo>
      )}
      {brandImage && <BrandBadge source={brandImage} />}
      <TextContainer>{children}</TextContainer>
    </CardBody>
  );
});

export const VerticalWhiskeyCard = React.memo(({
  whiskey,
  userPicture,
  onPress = () => {},
  mv = 16,
  isMyCollection = false,
  pour = false,
}: {
  whiskey?: any;
  userPicture?: any;
  mv?: number;
  isMyCollection?: boolean;
  onPress?: (whiskey: Whiskey) => any;
  pour?: boolean;
}) => {
  if (!whiskey) {
    return (
      <VerticalCard mv={mv}>
        <>
          <Skeleton width={175} height={32} />
          <SubtitleSection>
            <Skeleton width={60} height={28} />
          </SubtitleSection>
        </>
      </VerticalCard>
    );
  }

  return (
    <VerticalCard
      image={whiskey.picture}
      brand={whiskey.brandUser?.brandLogo}
      onPress={() => onPress(whiskey)}
      backgoundColor={isMyCollection ? 'primary700' : 'grey400'}
      mv={mv}
      pour={pour}
    >
      <>
        <SectionTitle bold size={15} numberOfLines={2}>
          {getFullWhiskeyName(whiskey)}
        </SectionTitle>
        <SubtitleSection>
          {!!whiskey?.type?.[0] && (
            <Tag text={capitalize(whiskey.type[0])} ellipsis />
          )}
          {isMyCollection && (
            <Text size={14} color="white">
                {whiskey.count}
                <Icon materialIcon="bottle-wine" size={14} color="white" />
              </Text>
          )}
          {!isMyCollection && userPicture && !!whiskey.calculatedRating && (
            <RatingContainer>
              <CrownIcon size={20} color="warning" />
              <Text size={14} mr={6}>
                {whiskey.calculatedRating}
              </Text>
              {whiskey.reviews.items[0] && (
                <>
                  <MaskedImage img={userPicture} />
                  <Text size={14}>{whiskey.reviews.items[0].rating}</Text>
                </>
              )}
            </RatingContainer>
          )}
        </SubtitleSection>
      </>
    </VerticalCard>
  );
});
