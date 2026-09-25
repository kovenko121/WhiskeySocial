import { useCallback } from 'react';
import { Alert } from 'react-native';
import { Icon, ModalBottom, Switch, Text } from '@components';
import {
  MenuContainer,
  MenuHeader,
  MenuOption,
  MenuOptionText,
  MuteRow,
  MuteTextContainer,
  Separator,
} from './styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  recipientName: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onDeleteConversation: () => void;
  onBlockUser: () => void;
  isUpdating: boolean;
};

const ConversationSettingsSheet = ({
  visible,
  onClose,
  recipientName,
  isMuted,
  onToggleMute,
  onDeleteConversation,
  onBlockUser,
  isUpdating,
}: Props) => {
  const handleDelete = useCallback(() => {
    onClose();
    Alert.alert(
      'Delete Conversation?',
      `Messages will be deleted from your inbox. ${recipientName} will still be able to see the conversation.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDeleteConversation,
        },
      ],
    );
  }, [onClose, recipientName, onDeleteConversation]);

  const handleBlock = useCallback(() => {
    onClose();
    Alert.alert(
      `Block @${recipientName}?`,
      "They won't be able to message you or see your profile. You can unblock them from Settings.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: onBlockUser,
        },
      ],
    );
  }, [onClose, recipientName, onBlockUser]);

  return (
    <ModalBottom visible={visible} onBackButtonPress={onClose}>
      <MenuContainer>
        <MenuHeader>
          <Text bold size={18} color="white">
            Conversation Settings
          </Text>
        </MenuHeader>

        {/* Mute toggle persists isMuted flag and shows bell-off icon in conversation list.
            Actual notification silencing requires FEAT-DM-11 (push notifications). */}
        <MuteRow>
          <Icon materialIcon="bell-off" size={22} color="grey200" />
          <MuteTextContainer>
            <Text size={16} color="white">
              Mute Notifications
            </Text>
            <Text size={12} color="grey300">
              {isMuted
                ? 'Notifications muted'
                : "You won't receive push notifications for this chat"}
            </Text>
          </MuteTextContainer>
          <Switch
            initValue={isMuted}
            onValueChange={onToggleMute}
            showText={false}
          />
        </MuteRow>

        <Separator />

        <MenuOption onPress={handleDelete} disabled={isUpdating}>
          <Icon materialIcon="trash-can-outline" size={22} color="danger500" />
          <MenuOptionText>
            <Text size={16} color="danger500">
              Delete Conversation
            </Text>
          </MenuOptionText>
        </MenuOption>

        <MenuOption onPress={handleBlock} disabled={isUpdating}>
          <Icon materialIcon="account-cancel" size={22} color="danger500" />
          <MenuOptionText>
            <Text size={16} color="danger500">
              Block @{recipientName}
            </Text>
          </MenuOptionText>
        </MenuOption>
      </MenuContainer>
    </ModalBottom>
  );
};

export default ConversationSettingsSheet;
