import { Button, Icon, KeyboardAvoidingContainer, Text } from '@components';
import { getTestId } from '@helpers';
import {
  useAppConfig,
  useFeatureFlags,
  useGetUser,
  useNotificationByUserId,
  useUserRewards,
} from '@hooks';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { UserType, type NavigationProps, UserReward,
  Routes
} from '@types';
import { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native';
import LogoDark from '../../../../../assets/images/logo-dark.png';
import RewardIconMarker from '../../../../../assets/images/reward-icon-marker.png';
import RewardIcon from '../../../../../assets/images/reward-icon.png';
import { ThankYouDialog } from '../../../Rewards';
import { RewardsWelcomeDialog } from '../../../Rewards/RewardsWelcome/RewardsWelcomeDialog';
import {
  Buttons,
  HeaderContainer,
  IconContainer,
  Logo,
  MainIcons,
  PostButton,
  RewardIconContainer,
  RewardsContainer,
  TopHeaderContainer,
} from './styles';

export const Header = ({
  setFindUserVisible,
  onCreatePostPress,
  isGuest = false,
}: {
  onCreatePostPress: any;
  setFindUserVisible: any;
  isGuest?: boolean;
}) => {
  const navigation = useNavigation<NavigationProps>();
  const [badgeText, setBadgeText] = useState<any>();
  const { data: user } = useGetUser();
  const { data, refetch } = useNotificationByUserId();
  const { data: userRewards, refetch: refetchUserRewards } = useUserRewards();
  const { data: featureFlags, refetch: refetchFeatureFlags } =
    useFeatureFlags();
  const { data: appConfig, refetch: refetchAppConfig } = useAppConfig();
  const [rewardsMarker, setRewardsMarker] = useState<boolean>(false);
  const [rewardsWelcomeVisible, setRewardsWelcomeVisible] = useState(false);
  const [rewardsThankYouVisible, setRewardsThankYouVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchFeatureFlags();
      refetchAppConfig();
      refetchUserRewards();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  useMemo(() => {
    const notificationCount =
      data?.pages.flatMap((page) => page?.items).length ?? 0;

    setBadgeText(notificationCount <= 9 ? notificationCount : '9+');
  }, [data]);

  useMemo(() => {
    const rewardsCompletedAndNotReedemed =
      userRewards?.items?.filter(
        (item: UserReward) => item?.isCompleted && !item?.isRedeemed
      ) ?? [];

    if (rewardsCompletedAndNotReedemed?.length || !user?.isOnRewards) {
      setRewardsMarker(true);
    } else {
      setRewardsMarker(false);
    }
  }, [userRewards, user?.isOnRewards]);

  return (
    <KeyboardAvoidingContainer>
      <SafeAreaView>
        <HeaderContainer>
          <TopHeaderContainer>
            <Logo source={LogoDark} contentFit="contain" />

            {!isGuest && !!featureFlags?.rewards && user?.userType === UserType.PERSON && (
              <RewardsContainer
                onPress={() => {
                  if (featureFlags) {
                    if (featureFlags?.rewardsFinished) {
                      setRewardsThankYouVisible(true);
                    } else if (user?.isOnRewards) {
                      navigation.navigate(Routes.ActiveRewards);
                    } else if (!user?.isOnRewards) {
                      setRewardsWelcomeVisible(true);
                    }
                  }
                }}
                testID={getTestId('reward')}
              >
                <RewardIconContainer
                  source={rewardsMarker ? RewardIconMarker : RewardIcon}
                />
              </RewardsContainer>
            )}
            {!isGuest && (
              <MainIcons>
                <IconContainer
                  onPress={() => navigation.navigate(Routes.Notifications)}
                  testID={getTestId('notifications')}
                >
                  <Icon
                    name="ring"
                    size={22}
                    color="primary600"
                    badgeText={badgeText?.toString()}
                  />
                </IconContainer>

                <IconContainer
                  onPress={() => navigation.navigate(Routes.Settings)}
                  testID={getTestId('settings')}
                >
                  <Icon name="gear" size={22} color="primary600" />
                </IconContainer>
              </MainIcons>
            )}
          </TopHeaderContainer>
          {!isGuest && (
            <PostButton
              onPress={onCreatePostPress}
              testID={getTestId('create-post-button')}
            >
              <Text color="white" size={14} mh={6} mv={6} style={{ flex: 1 }}>
                {appConfig?.createPostPlaceholder || 'What are you drinking today?'}
              </Text>
              <Icon name="picture" size={24} color="primary500" />
            </PostButton>
          )}

          <Buttons>
            {user?.userType === UserType.PERSON && (
              <Button
                mh={4}
                small
                label="  Find People"
                variant="outlineDefault"
                icon="add-user"
                onPress={() => setFindUserVisible(true)}
                iconSpacing={false}
              />
            )}
          </Buttons>
        </HeaderContainer>
        <RewardsWelcomeDialog
          visible={rewardsWelcomeVisible}
          onBackButtonPress={() => setRewardsWelcomeVisible(false)}
          isWelcomeBack={false}
        />
        <ThankYouDialog
          visible={rewardsThankYouVisible}
          onBackButtonPress={() => setRewardsThankYouVisible(false)}
        />
      </SafeAreaView>
    </KeyboardAvoidingContainer>
  );
};
