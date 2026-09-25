import { useAuth } from '@contexts';
import { getS3Image, getTimeAgo } from '@helpers';
import { useDeleteComment } from '@hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
  Comment,
  ImageUrl,
  NavigationProps,
  ReportContentType,
  S3Object,
  Routes
} from '@types';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import OutsidePressHandler from 'react-native-outside-press';
import { Icon } from '../Icon/Icon';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { Link, Text } from '../Text/Text';
import {
  AuthorContainer,
  CommentContainer,
  Content,
  ContentContainer,
  IconContainer,
  PictureContainer,
  TextContainer,
} from './styles';

export const PostComment = ({
  comment,
  onClose,
  onLongPressComment,
}: {
  comment: Comment;
  onClose: () => void;
  onLongPressComment?: () => void;
}) => {
  const navigation = useNavigation<NavigationProps>();
  const {
    user: { sub },
  } = useAuth();
  const { mutate } = useDeleteComment();
  const from = { page: 'Home' };

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [showReport, setShowReport] = useState(false);
  const [authorPicture, setAuthorPicture] = useState<
    ImageUrl | ImageSourcePropType
  >();

  const goToReportForm = () => {
    navigation.navigate(Routes.ReportForm, {
      contentId: comment.id,
      contentType: ReportContentType.COMMENT,
      reportedUserId: comment.authorId,
      from,
    });
    onClose();
  };

  const { author, text, createdAt, id } = comment;

  useEffect(() => {
    const getProfilePicture = async (pic: S3Object) => {
      const img = await getS3Image(pic);
      if (img) setAuthorPicture(img);
    };

    if (author?.profilePicture?.key) {
      getProfilePicture(author.profilePicture);
    }
  }, [author?.profilePicture]);

  const goToUserProfile = (userId: string) => {
    if (userId === sub) {
      navigation.navigate(Routes.MyCollection);
    } else {
      navigation.navigate(Routes.UserProfile, { id: userId });
    }
    onClose();
  };

  const deleteComment = () => {
    mutate({ commentId: id });
    setIsDeleting(true);
  };

  const highlightComment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <ContentContainer
      highlight={showDelete || showReport}
      onLongPress={async () => {
        await AsyncStorage.setItem('viewedDeleteCommentHint', 'true');

        if (comment.post?.authorId === sub || comment.authorId === sub) {
          highlightComment();
          setShowDelete(true);
        } else {
          highlightComment();
          setShowReport(true);
        }
        if (onLongPressComment) {
          onLongPressComment();
        }
      }}
    >
      <PictureContainer>
        <ProfilePicture
          size="x-small"
          image={authorPicture}
          onPress={() => goToUserProfile(author?.id!)}
        />
      </PictureContainer>

      <CommentContainer>
        <AuthorContainer>
          <Link bold color="white" onPress={() => goToUserProfile(author?.id!)}>
            {author?.username}
          </Link>
          <Text size={10} mh={4}>
            {getTimeAgo(createdAt, true)}
          </Text>
        </AuthorContainer>
        <Content>
          <TextContainer>
            <Text>{text}</Text>
          </TextContainer>
        </Content>
      </CommentContainer>
      {showDelete && (
        <OutsidePressHandler
          onOutsidePress={() => {
            setShowDelete(false);
          }}
        >
          {isDeleting ? (
            <IconContainer red>
              <ActivityIndicator />
            </IconContainer>
          ) : (
            <TouchableOpacity onPress={deleteComment}>
              <IconContainer red>
                <Icon name="trash" color="white" size={12} />
              </IconContainer>
            </TouchableOpacity>
          )}
        </OutsidePressHandler>
      )}

      {showReport ? (
        <OutsidePressHandler
          onOutsidePress={() => {
            setShowReport(false);
          }}
        >
          <TouchableOpacity onPress={goToReportForm}>
            <IconContainer red>
              <Icon name="report" color="white" size={12} />
            </IconContainer>
          </TouchableOpacity>
        </OutsidePressHandler>
      ) : (
        // <TouchableOpacity>
        <IconContainer>
          {/* <Icon name="heart" color="white" size={16} /> */}
        </IconContainer>
        // </TouchableOpacity>
      )}
    </ContentContainer>
  );
};
