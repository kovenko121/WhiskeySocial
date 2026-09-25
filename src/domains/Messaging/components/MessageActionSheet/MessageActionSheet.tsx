import { useCallback } from 'react';
import { Alert } from 'react-native';
import { Icon, ModalBottom, Text } from '@components';
import {
  MenuContainer,
  MenuHeader,
  MenuOption,
  MenuOptionText,
  Separator,
} from './styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
};

const MessageActionSheet = ({
  visible,
  onClose,
  onDeleteForMe,
  onDeleteForEveryone,
}: Props) => {
  const handleDeleteForMe = useCallback(() => {
    onClose();
    onDeleteForMe();
  }, [onClose, onDeleteForMe]);

  const handleDeleteForEveryone = useCallback(() => {
    onClose();
    Alert.alert(
      'Delete for everyone?',
      'This message will be removed for both you and the other person.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDeleteForEveryone,
        },
      ],
    );
  }, [onClose, onDeleteForEveryone]);

  return (
    <ModalBottom visible={visible} onBackButtonPress={onClose}>
      <MenuContainer>
        <MenuHeader>
          <Text bold size={18} color="white">
            Delete Message
          </Text>
        </MenuHeader>

        <MenuOption onPress={handleDeleteForMe}>
          <Icon materialIcon="eye-off-outline" size={22} color="grey200" />
          <MenuOptionText>
            <Text size={16} color="white">
              Delete for me
            </Text>
            <Text size={12} color="grey300">
              Remove from your view only
            </Text>
          </MenuOptionText>
        </MenuOption>

        <Separator />

        <MenuOption onPress={handleDeleteForEveryone}>
          <Icon materialIcon="delete-outline" size={22} color="danger500" />
          <MenuOptionText>
            <Text size={16} color="danger500">
              Delete for everyone
            </Text>
            <Text size={12} color="grey300">
              Remove for both you and the other person
            </Text>
          </MenuOptionText>
        </MenuOption>
      </MenuContainer>
    </ModalBottom>
  );
};

export default MessageActionSheet;
