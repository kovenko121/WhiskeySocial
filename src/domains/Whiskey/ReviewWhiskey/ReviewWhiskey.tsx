import {
  Button,
  Header,
  Input,
  KeyboardAvoidingScroll,
  StarRatingInput,
  TagSelect,
  Text,
  Title,
} from '@components';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAddWhiskeyToMyCollection, useCreateReview, useUpdateReview } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProps, RootStackParams } from '@types';
import { ReviewRecommendationTags, Routes } from '@types';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { ButtonsContainer, ContentWrapper, ScreenContainer } from './styles';
import { getValueIfDefined } from '../../../utils/common';

type Props = NativeStackScreenProps<RootStackParams, 'ReviewWhiskey'>;

type ReviewForm = {
  description: string | undefined;
  rating: number;
};

export const ReviewWhiskeyScreen = ({ route }: Props) => {
  const navigation = useNavigation<NavigationProps>();
  const {
    id: whiskeyId,
    name: whiskeyName,
    ...bottleDetails
  } = route.params.whiskey;
  const { fromPost, remainingWhiskeys = [], existingReview } = route.params;
  const isEditing = !!existingReview;

  // Handle multi-whiskey review flow
  // When a review is submitted and there are more whiskeys to review,
  // navigate to the next whiskey instead of going home
  const handleReviewSuccess = () => {
    if (remainingWhiskeys.length > 0) {
      const nextWhiskey = remainingWhiskeys[0];
      navigation.navigate(Routes.ReviewWhiskey, {
        whiskey: {
          id: nextWhiskey.id,
          name: nextWhiskey.name,
        },
        fromPost: true,
        remainingWhiskeys: remainingWhiskeys.slice(1),
      });
    } else {
      navigation.navigate(Routes.Home);
    }
  };

  const { mutate: addToCollection, isPending: isAddingToCollection } = useAddWhiskeyToMyCollection();
  const { mutate: createReview, isPending: isCreatingReview } = useCreateReview(
    'Home',
    fromPost && remainingWhiskeys.length > 0 ? handleReviewSuccess : undefined
  );
  const { mutate: updateReview, isPending: isUpdatingReview } = useUpdateReview('Home');

  const isLoading = (() => {
    if (isEditing) return isUpdatingReview;
    if (fromPost) return isCreatingReview;
    return isAddingToCollection;
  })();

  const validationSchema = yup.object().shape({
    description: yup.string().trim(),
    rating: yup.number(),
  });

  const {
    clearErrors,
    getValues,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      rating: getValueIfDefined(existingReview?.rating, 'number', 5) as number,
      description: existingReview?.description ?? undefined,
    },
  });
  const [recommendationTags, setRecommendationTags] = useState<ReviewRecommendationTags[]>(
    (existingReview?.recommendationTags as ReviewRecommendationTags[] | null) ?? []
  );

  const withoutErrors = errors && Object.keys(errors).length === 0;

  // Reset form when whiskey changes (for multi-whiskey review flow)
  useEffect(() => {
    if (!isEditing) {
      reset({
        description: undefined,
        rating: 5,
      });
      setRecommendationTags([]);
    }
  }, [whiskeyId, reset, isEditing]);

  const onSubmit = async (dataForm: ReviewForm) => {
    
    if (withoutErrors) {
      if (isEditing) {
        updateReview({
          id: existingReview.id,
          whiskeyId,
          recommendationTags,
          specialistReview: existingReview.specialistReview,
          ...dataForm,
        });
      } else if (fromPost) {
        createReview({
          whiskeyId,
          recommendationTags,
          ...dataForm,
        });
      } else {
        addToCollection({
          whiskeyId,
          recommendationTags,
          ...bottleDetails,
          ...dataForm,
        });
      }
    }
  };

  const skipReview = async () => {
    if (withoutErrors) {
      if (fromPost) {
        if (remainingWhiskeys.length > 0) {
          const nextWhiskey = remainingWhiskeys[0];
          navigation.navigate(Routes.ReviewWhiskey, {
            whiskey: {
              id: nextWhiskey.id,
              name: nextWhiskey.name,
            },
            fromPost: true,
            remainingWhiskeys: remainingWhiskeys.slice(1),
          });
        } else {
          navigation.navigate(Routes.Home);
        }
      } else {
        addToCollection({
          whiskeyId,
          recommendationTags,
          ...bottleDetails,
        });
      }
    }
  };

  const onChange = (name: any, field: any) => {
    setValue(name, field);
    clearErrors(name);
  };

  useEffect(() => {
    register('rating');
    register('description');
  }, [register]);

  const resolveSubmitLabel = () => {
    if (isEditing) return 'Update Review';
    if (fromPost) return 'Save Review';
    return 'Save Review and Add to My Collection';
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingScroll>
        <ContentWrapper>
          <>
            <Header />

            <Title color="primary" size={28}>
              {whiskeyName
                ? `What do you think about ${whiskeyName}?`
                : `What do you think${'\n'}about this whiskey?`}
            </Title>
            <Text size={13} align="center" mv={12} mh={12}>
              Help us understand your taste by telling us what you think
              about it. This will be used to give all users better
              recommendations.
            </Text>
            <StarRatingInput
              mv={8}
              rate={getValues('rating')}
              setRate={(rating) => onChange('rating', rating)}
            />
            <Input
              placeholder="Leave your review"
              numberOfLines={3}
              mv={10}
              editable
              onChangeText={(text) => onChange('description', text)}
              value={getValues('description')}
              multiline
              maxLength={1000}
              counter={`${1000 - (getValues('description')?.length ?? 0)} / 1000`}
              error={!!errors?.description}
              errorMessage={errors?.description?.message}
            />
            <Text size={13} align="center" mv={24} bold>
              What are the flavors on this whiskey?
            </Text>
            <TagSelect
              tags={Object.keys(ReviewRecommendationTags)}
              selectedTags={recommendationTags}
              setSelectedTags={setRecommendationTags}
              mv={0}
            />
          </>
          <ButtonsContainer>
            {!isEditing && (
              <Button
                label={fromPost ? "Skip Review" : "Skip Review and Add to My Collection"}
                variant="outlineDefault"
                loading={isLoading}
                disabled={!withoutErrors}
                onPress={handleSubmit(skipReview)}
              />
            )}
            <Button
              label={resolveSubmitLabel()}
              loading={isLoading}
              disabled={!withoutErrors}
              onPress={handleSubmit(onSubmit)}
            />
          </ButtonsContainer>
        </ContentWrapper>
      </KeyboardAvoidingScroll>
    </ScreenContainer>
  );
};
