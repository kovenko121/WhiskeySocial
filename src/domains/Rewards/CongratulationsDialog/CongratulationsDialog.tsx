import { Button, Icon, Link, ModalBottom, Text, Title } from '@components';
import { useReward } from '@contexts';
import { capitalize } from '@helpers';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps,
  Routes
} from '@types';
import RewardIcon from '../../../../assets/images/reward-icon.png';
import {
  ButtonContainer,
  Card,
  CardTitle,
  ContentContainer,
  RewardImage,
  RewardImageContainer,
  SubtitleContainer,
  TitleContainer,
} from './styles';

const CongratulationsDialog = () => {
  const { rewardsCompleted, setRewardsCompleted } = useReward();
  const closeModal = () => {
    setRewardsCompleted({});
  };
  const navigation = useNavigation<NavigationProps>();

  return (
    <ModalBottom
      onBackButtonPress={closeModal}
      visible={!!Object.keys(rewardsCompleted).length}
    >
      <ContentContainer>
        <Link color="primary500" bold onPress={closeModal}>
          Close
        </Link>
        <RewardImageContainer>
          <RewardImage source={RewardIcon} />
        </RewardImageContainer>

        <TitleContainer>
          <Title size={27} align="center">
            Congratulations
          </Title>
        </TitleContainer>

        <SubtitleContainer>
          <Text mv={4} align="center" size={12}>
            You've just completed a challenge!Now, go claim your prize.
          </Text>
        </SubtitleContainer>

        {rewardsCompleted?.score && rewardsCompleted?.reward?.conditions?.[0] && (
          <Card>
            <CardTitle>
              <Icon size={18} color="primary" name="wine" />
              <Text size={14} bold mh={8}>
                {capitalize(rewardsCompleted.reward.conditions[0].key)}
              </Text>
            </CardTitle>
            <Text>{`${rewardsCompleted.score} ${capitalize(
              rewardsCompleted.reward.conditions[0].key
            )}'s`}</Text>
          </Card>
        )}
      </ContentContainer>
      <ButtonContainer>
        <Button
          label="Go to prize!"
          icon="trophy"
          iconSize={18}
          onPress={() => {
            closeModal();
            navigation.navigate(Routes.RewardRedeem, {
              rewardImage: rewardsCompleted.reward.photo,
              rewardTitle: rewardsCompleted.reward.title,
              rewardId: rewardsCompleted.id,
              isTshirt:
                rewardsCompleted.reward?.sizes !== null ||
                rewardsCompleted.reward?.models !== null,
              sizes: rewardsCompleted.reward.sizes,
              models: rewardsCompleted.reward.models,
            });
          }}
        />
      </ButtonContainer>
    </ModalBottom>
  );
};
export { CongratulationsDialog };
