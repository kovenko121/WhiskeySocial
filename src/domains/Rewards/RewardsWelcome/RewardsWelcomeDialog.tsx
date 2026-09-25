import { Button, CrownIcon, Icon, Link, ModalBottom, Text, Title } from '@components';
import { useSetUserIsOnRewards } from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps,
  Routes
} from '@types';
import RewardIcon from '../../../../assets/images/reward-icon.png';
import {
  ButtonContainer,
  Card,
  CardsList,
  ContentContainer,
  RewardImage,
  RewardImageContainer,
  SubtitleContainer,
  TitleContainer,
} from './styles';

const RewardsWelcomeDialog = ({
  visible,
  onBackButtonPress,
  isWelcomeBack = false,
}: {
  visible: boolean;
  onBackButtonPress: () => void;
  isWelcomeBack: boolean;
}) => {
  const closeModal = () => {
    onBackButtonPress();
  };
  const navigation = useNavigation<NavigationProps>();
  const { mutate, isLoading } = useSetUserIsOnRewards(() => {
    closeModal();
    navigation.navigate(Routes.ActiveRewards);
  });

  type CardContent = {
    icon: string;
    title: string;
    subtitle: string;
  };
  const cardsContent = [
    {
      icon: 'wine',
      title: 'Interact',
      subtitle:
        'Socialize with people by creating posts sharing your whiskey experiences',
    },
    {
      icon: 'crown',
      title: 'Review',
      subtitle:
        'Speak your mind and show everyone what you think about whiskeys',
    },
    {
      icon: 'map',
      title: 'Visit',
      subtitle:
        'Find new venues around you and register your visits by checking-in',
    },
  ];

  return (
    <ModalBottom onBackButtonPress={closeModal} visible={visible}>
      <ContentContainer>
        <Link color="primary500" bold onPress={onBackButtonPress}>
          Close
        </Link>
        <RewardImageContainer>
          <RewardImage source={RewardIcon} />
        </RewardImageContainer>

        <TitleContainer>
          <Title size={27} align="center">
            {isWelcomeBack ? "Guess who's back!" : 'Welcome to WS Rewards!'}
          </Title>
        </TitleContainer>

        <SubtitleContainer>
          <Text mv={4} align="center" size={12}>
            {isWelcomeBack
              ? 'WS Rewards is back again with more prizes opportunities. Start now to have more chances of winning.'
              : 'Earn prizes by interacting with people and completing activities daily inside the app (while supplies last).'}{' '}
          </Text>
        </SubtitleContainer>

        <CardsList
          data={cardsContent as CardContent[]}
          horizontal
          renderItem={({ item }: { item: CardContent }) => (
            <Card>
              {item.icon === 'crown' ? (
                <CrownIcon size={22} color="primary500" />
              ) : (
                <Icon color="primary" size={22} name={item.icon} />
              )}
              <Text size={14} bold>
                {item.title}
              </Text>
              <Text mv={4} size={9}>
                {item.subtitle}
              </Text>
            </Card>
          )}
        />
        <SubtitleContainer>
          <Text mv={6} align="center" size={9}>
            Each interaction will be counted only once a day.
          </Text>
        </SubtitleContainer>

      </ContentContainer>
      <ButtonContainer>
        <Button
          label="Start Now!"
          icon="trophy"
          iconSize={22}
          loading={isLoading}
          onPress={mutate}
        />
      </ButtonContainer>
    </ModalBottom>
  );
};
export { RewardsWelcomeDialog };
