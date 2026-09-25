import { Button, CrownIcon, Icon, Tag, Text, Title } from '@components';
import { getS3Image } from '@helpers';
import { useNavigation } from '@react-navigation/native';
import { Icons, ImageUrl, NavigationProps, S3Object, UserReward,
  Routes
} from '@types';
import { useEffect, useState } from 'react';
import { ImageSourcePropType } from 'react-native';
import { AnimatedProgressBar } from './ProgressBar/AnimatedProgressBar';
import {
  ButtonContainer,
  DescriptionContainer,
  ProgressRow,
  RewardCard,
  RewardImageCover,
  RewardInforContainer,
  RewardItemImage,
  RewardStatusContainer,
  Row,
} from './styles';

const RewardCardComponent = ({ rewardItem }: { rewardItem: UserReward }) => {
  const [rewardImage, setRewardImage] = useState<
    ImageUrl | ImageSourcePropType
  >();

  useEffect(() => {
    const setRewardImg = async (pic: S3Object) => {
      const img = await getS3Image(pic);
      if (img) setRewardImage(img);
    };

    if (rewardItem.reward?.photo) {
      setRewardImg(rewardItem.reward?.photo);
    }
  }, [rewardItem.reward?.photo]);

  const navigation = useNavigation<NavigationProps>();

  const getTagInfo = () => {
    if (rewardItem.isRedeemed) {
      return {
        tagLabel: 'Redeemed',
        tagIconName: 'trophy',
        tagColor: 'primary',
      };
    }
    if (!rewardItem.reward?.isAvailable) {
      return {
        tagLabel: 'Sold Out',
        tagIconName: 'close',
        tagColor: 'grey300',
      };
    }

    if (rewardItem.isCompleted && rewardItem.reward?.isAvailable) {
      return {
        tagLabel: 'Redeem Now!',
        tagIconName: 'trophy',
        tagColor: 'primary',
      };
    }

    return {
      tagLabel: 'In Progress',
      tagIconName: 'dot-menu-horizontal',
      tagColor: 'primary',
    };
  };

  const getButtonInfo = () => {
    if (rewardItem.isRedeemed) {
      return {
        buttonLabel: 'Tracking Info',
        buttonIconName: 'truck',
      };
    }
    if (!rewardItem.reward?.isAvailable) {
      return {
        buttonLabel: 'Sold Out',
        buttonIconName: 'close',
      };
    }

    if (rewardItem.isCompleted && rewardItem.reward?.isAvailable) {
      return {
        buttonLabel: 'Claim Reward!',
        buttonIconName: 'trophy',
      };
    }

    return {
      buttonLabel: 'Reward not unlocked yet',
      buttonIconName: 'trophy',
    };
  };

  const { tagLabel, tagIconName, tagColor } = getTagInfo();
  const { buttonLabel, buttonIconName } = getButtonInfo();

  const getProgressBarIcon = (): 'close' | 'wine' | 'gps' | 'crown' => {
    if (!rewardItem.reward?.isAvailable) {
      return 'close';
    }

    if (rewardItem.reward.conditions) {
      switch (rewardItem.reward?.conditions[0]?.key) {
        case 'post':
          return 'wine';
        case 'checkin':
          return 'gps';
        default:
          return 'crown';
      }
    }
    return 'crown';
  };

  const getConditionDescription = () => {
    if (rewardItem.reward?.conditions) {
      switch (rewardItem.reward?.conditions[0]?.key) {
        case 'checkin':
          return 'check-ins performed';
        case 'post':
          return 'posts created';
        case 'review':
          return 'reviews submitted';
        default:
          return ' ';
      }
    }
    return ' ';
  };

  const getProgress = () => {
    if (rewardItem.reward) {
      if (rewardItem.reward.conditions) {
        const condition = rewardItem.reward.conditions[0];
        if (!condition) return 0;
        const scoreToReach = condition.value as unknown as number;
        return ((rewardItem.score / scoreToReach) * 100).toFixed();
      }
    }
    return 0;
  };

  const goToNextScreen = () => {
    if (rewardItem.isRedeemed) {
      navigation.navigate(Routes.TrackingInfo, {
        trackingCode: rewardItem.trackingCode,
        service: rewardItem.service,
        address: rewardItem.address,
        shirtSize: rewardItem.size,
        shirtModel: rewardItem.model,
        rewardImage,
      });
    } else {
      navigation.navigate(Routes.RewardRedeem, {
        rewardImage: rewardItem.reward?.photo,
        rewardTitle: rewardItem.reward?.title,
        rewardId: rewardItem.id,
        isTshirt:
          rewardItem.reward?.sizes !== null ||
          rewardItem.reward?.models !== null,
        sizes: rewardItem.reward?.sizes,
        models: rewardItem.reward?.models,
      });
    }
  };

  const getConditionValue = () => {
    if (rewardItem.reward?.conditions) {
      return rewardItem.reward?.conditions[0]?.value;
    }
    return '';
  };
  return (
    <RewardCard>
      <RewardItemImage source={rewardImage}>
        {rewardItem.isRedeemed ? (
          <>
            <RewardImageCover color="primary" />
            <Icon color="primary" size={70} name="trophy" />
          </>
        ) : (
          !rewardItem.reward!.isAvailable && (
            <>
              <RewardImageCover color="grey300" />
              <Icon color="grey200" size={70} name="close" />
            </>
          )
        )}
      </RewardItemImage>
      <RewardStatusContainer>
        <Tag
          selected
          icon={tagIconName}
          text={tagLabel}
          backgroundColor={tagColor}
        />
      </RewardStatusContainer>

      <RewardInforContainer>
        <Title mh={0} size={18} bold align="left">
          {rewardItem.reward?.title}
        </Title>
        <DescriptionContainer>
          <Text size={12}>{rewardItem.reward?.description}</Text>
        </DescriptionContainer>

        <Text
          color={rewardItem.reward?.isAvailable ? 'white' : 'grey200'}
          bold
          mv={10}
          size={9}
        >
          Reward Progress (daily interaction)
        </Text>
        <Row>
          <ProgressRow>
            {getProgressBarIcon() === 'crown' ? (
              <CrownIcon
                size={15}
                color={rewardItem.reward?.isAvailable ? 'primary500' : 'grey200'}
              />
            ) : (
              <Icon
                size={15}
                color={rewardItem.reward?.isAvailable ? 'primary' : 'grey200'}
                name={getProgressBarIcon() as Icons}
              />
            )}
            <Text color={rewardItem.reward?.isAvailable ? 'white' : 'grey200'}>
              {'  '}
              {rewardItem.score}/{getConditionValue()}{' '}
              {getConditionDescription()}{' '}
            </Text>
          </ProgressRow>
          <Text
            size={12}
            color={rewardItem.reward?.isAvailable ? 'primary' : 'grey200'}
          >
            {getProgress()}%
          </Text>
        </Row>

        <AnimatedProgressBar
          progress={getProgress() as number}
          color={rewardItem.reward?.isAvailable ? 'primary' : 'grey200'}
        />
      </RewardInforContainer>

      <ButtonContainer>
        <Button
          label={buttonLabel}
          icon={buttonIconName as Icons}
          iconSize={18}
          mv={18}
          testID={` ${buttonLabel}-${rewardItem.reward?.title}`}
          disabled={
            (!rewardItem.reward?.isAvailable && !rewardItem.isRedeemed) ||
            !rewardItem.isCompleted ||
            (!rewardItem.trackingCode && rewardItem.isRedeemed)
          }
          onPress={() => goToNextScreen()}
        />
      </ButtonContainer>
    </RewardCard>
  );
};

export { RewardCardComponent };
