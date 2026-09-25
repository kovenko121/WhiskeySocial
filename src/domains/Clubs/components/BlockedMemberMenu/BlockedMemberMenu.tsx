import { Icon, ModalBottom, Text } from '@components';
import { ClubMember } from '@types';
import {
  MenuContainer,
  MenuHeader,
  MenuOption,
  MenuOptionText,
  Separator,
} from '../MemberActionMenu/styles';

interface BlockedMemberMenuProps {
  visible: boolean;
  member: ClubMember | null;
  onClose: () => void;
  onUnblock: (member: ClubMember) => void;
  onAcceptAsMember: (member: ClubMember) => void;
}

export const BlockedMemberMenu = ({
  visible,
  member,
  onClose,
  onUnblock,
  onAcceptAsMember,
}: BlockedMemberMenuProps) => {
  if (!member) return null;

  const handleAcceptAsMember = () => {
    onAcceptAsMember(member);
    onClose();
  };

  const handleUnblock = () => {
    onUnblock(member);
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

        <MenuOption onPress={handleAcceptAsMember}>
          <Icon name="check" size={22} color="primary500" />
          <MenuOptionText>
            <Text size={16} color="white">Accept as Member</Text>
          </MenuOptionText>
        </MenuOption>

        <Separator />

        <MenuOption onPress={handleUnblock}>
          <Icon name="unlock" size={22} color="grey200" />
          <MenuOptionText>
            <Text size={16} color="white">Unblock to Pending</Text>
          </MenuOptionText>
        </MenuOption>
      </MenuContainer>
    </ModalBottom>
  );
};
