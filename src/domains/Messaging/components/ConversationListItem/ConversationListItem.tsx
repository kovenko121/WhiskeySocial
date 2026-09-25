import { memo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Icon, ProfilePicture, Text } from '@components';
import { useProfilePicture } from '@hooks';
import { Routes } from '@types';
import type { NavigationProps
} from '@types';
import type { ConversationListItem as ConversationListItemType } from '../../../../hooks/messaging/useConversations';
import { formatConversationTime } from '../../../../helpers/formatConversationTime';
import {
  ItemContainer,
  AvatarContainer,
  ContentContainer,
  TopRow,
  BottomRow,
  UsernameContainer,
  RightContainer,
  UnreadBadge,
  MuteIconContainer,
} from './styles';

type Props = {
  conversation: ConversationListItemType;
  requestStatus?: string;
};

const ConversationListItem = ({ conversation, requestStatus }: Props) => {
  const navigation = useNavigation<NavigationProps>();
  const { profilePictureUri } = useProfilePicture(
    conversation.otherUser.profilePicture as any,
  );

  const handlePress = useCallback(() => {
    navigation.navigate(Routes.Conversation, {
      conversationId: conversation.conversationId,
      recipientId: conversation.otherUser.id,
      recipientName: conversation.otherUser.username,
      recipientImage: profilePictureUri ? { uri: profilePictureUri } : null,
      requestStatus,
      participantId: conversation.participantId,
      isMuted: conversation.isMuted,
    });
  }, [conversation, profilePictureUri, navigation, requestStatus]);

  const hasUnread = conversation.unreadCount > 0;

  return (
    <ItemContainer onPress={handlePress}>
      <AvatarContainer>
        <ProfilePicture
          size="small"
          image={profilePictureUri ? { uri: profilePictureUri } : null}
          border={false}
          disabled
        />
      </AvatarContainer>

      <ContentContainer>
        <TopRow>
          <UsernameContainer>
            <Text size={14} color="white" bold numberOfLines={1}>
              {conversation.otherUser.username}
            </Text>
            {conversation.isMuted && (
              <MuteIconContainer>
                <Icon materialIcon="bell-off" size={12} color="grey300" />
              </MuteIconContainer>
            )}
          </UsernameContainer>
          {conversation.lastMessageAt && (
            <Text size={12} color="grey300">
              {formatConversationTime(conversation.lastMessageAt)}
            </Text>
          )}
        </TopRow>

        <BottomRow>
          <Text
            size={13}
            color={hasUnread ? 'grey50' : 'grey300'}
            numberOfLines={1}
            style={{ flex: 1 }}
          >
            {conversation.lastMessageText || 'No messages yet'}
          </Text>
          {hasUnread && (
            <RightContainer>
              <UnreadBadge>
                <Text size={11} color="white" bold>
                  {conversation.unreadCount}
                </Text>
              </UnreadBadge>
            </RightContainer>
          )}
        </BottomRow>
      </ContentContainer>
    </ItemContainer>
  );
};

export default memo(ConversationListItem);
