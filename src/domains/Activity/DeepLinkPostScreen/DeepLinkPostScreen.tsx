import {
  BottomNavbar,
  CommentPostScreen,
  Header,
  LoadingComponent,
  PostCard,
} from '@components';
import { useAuth } from '@contexts';
import { useGetUserClubs, usePostById } from '@hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Post, RootStackParams } from '@types';
import { useMemo, useState } from 'react';
import {
  ContentContainer,
  LoadingComponentView,
  PostContainer,
  ScreenContainer,
} from './styles';

type Props = NativeStackScreenProps<RootStackParams, 'PostScreen'>;

export const DeepLinkPostScreen = ({ navigation, route }: Props) => {
  const { data, isLoading } = usePostById(route.params.id);
  const [commentPostScreen, setCommentPostScreen] = useState<boolean>(false);

  // Get current user's clubs for share button validation
  const { user: { sub } } = useAuth();
  const { data: userClubs } = useGetUserClubs({ userId: sub });
  const userClubIds = useMemo(() => userClubs?.map(club => club.id) ?? [], [userClubs]);

  return (
    <ScreenContainer>
      <ContentContainer>
        <Header title="Post" navBack={() => navigation.goBack()} />
        {data && (
          <PostContainer>
            <PostCard
              post={data as Post}
              isFetching={isLoading}
              onCommentPress={() => setCommentPostScreen(true)}
              from={{ page: 'DeepLinkPostScreen' }}
              padded={false}
              userActiveClubIds={userClubIds}
            />
          </PostContainer>
        )}
        {isLoading && (
          <LoadingComponentView>
            <LoadingComponent />
          </LoadingComponentView>
        )}
      </ContentContainer>
      <BottomNavbar active="home" />
      <CommentPostScreen
        onBackButtonPress={() => setCommentPostScreen(!commentPostScreen)}
        visible={commentPostScreen}
        postId={route.params.id}
      />
    </ScreenContainer>
  );
};
