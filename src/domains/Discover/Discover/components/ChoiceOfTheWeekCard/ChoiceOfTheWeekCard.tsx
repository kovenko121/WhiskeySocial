import { CrownIcon, Icon, MaskedImage, Skeleton, Tag, Text, Title } from '@components';
import { getFullWhiskeyName, getTestId } from '@helpers';
import {
  useChoiceOfTheWeek,
  useGetUser,
  useHadPouredThisWhiskey,
} from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, UserType,
  Routes
} from '@types';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import {
  BrandPicture,
  ChoiceInfo,
  NameSection,
  Picture,
  PourLogo,
  RatingContainer,
  SkeletonEmpty,
  SkeletonSpacer,
  TagContainer,
  TitleConteiner,
} from './styles';

export const ChoiceOfTheWeekCard = React.memo(() => {
  const navigation = useNavigation<NavigationProps>();
  const { data: user, isLoading: userLoading } = useGetUser();
  const { data: choiceOfTheWeek, isLoading: choiceOfTheWeekLoading } =
    useChoiceOfTheWeek();
  const { checkIfUserPoured } = useHadPouredThisWhiskey();
  const [filteredReview, setFilteredReview] = useState<number | null>(null);
  useEffect(() => {
    if (user && user?.whiskeys && user?.whiskeys?.items) {
      const foundedUserWhiskey = user?.whiskeys?.items
        .flatMap((userWhiskey) =>
          userWhiskey?.whiskey ? { ...userWhiskey.whiskey } : []
        )
        .filter((obj) => obj.id === choiceOfTheWeek?.id)[0];
      setFilteredReview(foundedUserWhiskey?.reviews?.items[0]?.rating || null);
    }
  }, [user, choiceOfTheWeek]);

  const goToWhiskey = async (id: string) => {
    navigation.navigate(Routes.WhiskeyInfo, { id });
  };

  if (choiceOfTheWeekLoading && userLoading) {
    return (
      <>
        <TitleConteiner>
          <Skeleton width="100%" height={40} />
        </TitleConteiner>
        <TouchableOpacity onPress={() => {}} disabled>
          <Skeleton width="100%" height={350} />
        </TouchableOpacity>
        <SkeletonSpacer />
        <ChoiceInfo>
          <Skeleton width={50} height={50} radius={50} />
          <SkeletonSpacer />
          <NameSection>
            <Skeleton width="70%" height={50} />
          </NameSection>
        </ChoiceInfo>
        <SkeletonEmpty />
      </>
    );
  }

  if (!choiceOfTheWeek && !choiceOfTheWeekLoading && !userLoading) {
    return null;
  }

  return (
    <>
      <TitleConteiner>
        <Icon name="specialist" size={28} color="primary500" />
        <Title mb={5} size={18}>
          Specialist's Choice of the week
        </Title>
      </TitleConteiner>
      <TouchableOpacity
        testID={getTestId('choice-of-the-week')}
        onPress={() => {
          if (choiceOfTheWeek?.id) {
            goToWhiskey(choiceOfTheWeek?.id);
          }
        }}
      >
        <Picture source={choiceOfTheWeek?.picture} />

        {checkIfUserPoured(choiceOfTheWeek?.id) && (
          <PourLogo>
            <Icon name="pour" size={20} color="white" />
          </PourLogo>
        )}

        <ChoiceInfo>
          <BrandPicture source={choiceOfTheWeek?.brandUser?.brandLogo} />
          <TagContainer>
            <Tag selected text={choiceOfTheWeek?.type?.[0] || ''} />
          </TagContainer>
          <NameSection>
            <Text size={15} bold>
              {choiceOfTheWeek && getFullWhiskeyName(choiceOfTheWeek!)}
            </Text>

            {user?.userType === UserType.PERSON &&
              user.profilePictureLoaded &&
              !!choiceOfTheWeek?.calculatedRating && (
                <RatingContainer>
                  <CrownIcon size={20} color="warning" />
                  <Text size={14} mr={6}>
                    {choiceOfTheWeek?.calculatedRating}
                  </Text>
                  {filteredReview && (
                    <>
                      <MaskedImage img={user.profilePictureLoaded} />
                      <Text size={14}>{filteredReview}</Text>
                    </>
                  )}
                </RatingContainer>
              )}
          </NameSection>
        </ChoiceInfo>
      </TouchableOpacity>
    </>
  );
});
