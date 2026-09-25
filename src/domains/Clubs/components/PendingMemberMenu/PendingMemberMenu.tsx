import { Icon, ModalBottom, Text } from '@components';
import { ClubMember } from '@types';
import {
  MenuContainer,
  MenuHeader,
  MenuOption,
  MenuOptionText,
  Separator,
} from '../MemberActionMenu/styles';

interface PendingMemberMenuProps {
  visible: boolean;
  member: ClubMember | null;
  onClose: () => void;
  onAccept: (member: ClubMember) => void;
  onReject: (member: ClubMember) => void;
  onBlock: (member: ClubMember) => void;
}

export const PendingMemberMenu = ({
  visible,
  member,
  onClose,
  onAccept,
  onReject,
  onBlock,
}: PendingMemberMenuProps) => {
  if (!member) return null;

  const handleAccept = () => {
    onAccept(member);
    onClose();
  };

  const handleReject = () => {
    onReject(member);
    onClose();
  };

  const handleBlock = () => {
    onBlock(member);
    onClose();
  };

  return (
    <ModalBottom visible={visible} onBackButtonPress={onClose}>
      <MenuContainer>
        <MenuHeader>
          <Text bold size={18} color="white">
            @{member.user?.username}
          </Text>
        </MenuHeader>

        <MenuOption onPress={handleAccept}>
          <Icon name="check" size={22} color="primary500" />
          <MenuOptionText>
            <Text size={16} color="white">Accept Request</Text>
          </MenuOptionText>
        </MenuOption>

        <Separator />

        <MenuOption onPress={handleReject}>
          <Icon name="close" size={22} color="danger500" />
          <MenuOptionText>
            <Text size={16} color="danger500">
              Reject Request
            </Text>
          </MenuOptionText>
        </MenuOption>

        <MenuOption onPress={handleBlock}>
          <Icon name="lock" size={22} color="danger500" />
          <MenuOptionText>
            <Text size={16} color="danger500">
              Block User
            </Text>
          </MenuOptionText>
        </MenuOption>
      </MenuContainer>
    </ModalBottom>
  );
};
