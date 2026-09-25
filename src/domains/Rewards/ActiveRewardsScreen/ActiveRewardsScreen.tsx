import { Header, LoadingComponent, Text } from '@components';
import { useUserRewards } from '@hooks';
import { UserReward } from '@types';
import { RewardCardComponent } from '../components/RewardCard';
import {
  ContentContainer,
  Empty,
  LoadingComponentContainer,
  RewardList,
  ScreenContainer,
  TextContainer,
} from './styles';


const ActiveRewardsScreen = () => {
  const { data: userRewards } = useUserRewards();

  return (
    <ScreenContainer>
      <ContentContainer>
        <Header
          title="WS Rewards"
        />
      </ContentContainer>
      <TextContainer>
        <Text size={12} align="center">
          Earn prizes by interacting with people and completing activities daily
          inside the app (while supplies last).
        </Text>
      </TextContainer>
      {userRewards ? (
        <RewardList
          showsHorizontalScrollIndicator={false}
          horizontal
          data={
            userRewards.items.sort((a: UserReward, b: UserReward) =>
              a.reward.title.localeCompare(b.reward.title)
            ) as UserReward[]
          }
          renderItem={({ item }: { item: UserReward }) => (
            <RewardCardComponent rewardItem={item as UserReward} />
          )}
          ListFooterComponent={<Empty />}
        />
      ) : (
        <LoadingComponentContainer>
          <LoadingComponent duration={10000} />
        </LoadingComponentContainer>
      )}
    </ScreenContainer>
  );
};
export { ActiveRewardsScreen };
