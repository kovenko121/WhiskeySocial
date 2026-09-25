import { Button, Header, Text, Title } from '@components';
import { getS3Image } from '@helpers';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams, S3Object,
  Routes
} from '@types';
import { useEffect, useState } from 'react';
import ImageDecoration from '../../../../../assets/images/rewards-decoration.png';
import {
  ContentContainer,
  RedeemInfoColumn,
  RewardImageContainer,
  RewardItemImage,
  RewardPictureDecoration,
  ScreenContainer,
  SubtitleContainer,
  TitleContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'RewardRedeem'>;
const RewardRedeemScreen = ({ navigation, route }: Props) => {
  const [rewardImage, setRewardImage] = useState<any>();

  useEffect(() => {
    const setRewardImg = async (pic: S3Object) => {
      const img = await getS3Image(pic);
      if (img) setRewardImage(img);
    };

    if (route.params.rewardImage) {
      setRewardImg(route.params.rewardImage);
    }
  }, [route.params.rewardImage]);

  return (
    <ScreenContainer>
      <ContentContainer>
        <Header title="WS Rewards" />

        <RedeemInfoColumn>
          <TitleContainer>
            <Title size={27} align="center">
              Redeem Time!
            </Title>
          </TitleContainer>
          <SubtitleContainer>
            <Text mv={10} align="center" size={12}>
              Thank you for helping us building a live community for whiskey
              enthusiasts. Now it's time for some recognition:
            </Text>
          </SubtitleContainer>
          <RewardImageContainer>
            <RewardItemImage source={rewardImage || { uri: '' }} />
            <RewardPictureDecoration source={ImageDecoration} />
          </RewardImageContainer>
          <Title size={18} align="center">
            {route.params.rewardTitle || ''}
          </Title>
        </RedeemInfoColumn>

        <Button
          mv={44}
          label="Fill shipping info"
          icon="truck"
          iconSize={18}
          onPress={() =>
            navigation.navigate(Routes.ShippingInfo, {
              rewardId: route.params.rewardId,
              isTshirt: route.params.isTshirt,
              sizes: route.params.sizes,
              models: route.params.models,
            })
          }
        />
      </ContentContainer>
    </ScreenContainer>
  );
};
export { RewardRedeemScreen };
