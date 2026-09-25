import { Icon, ModalBottom, Text } from '@components';
import { ClubMember, ClubRole } from '@types';
import {
  MenuContainer,
  MenuHeader,
  MenuOption,
  MenuOptionText,
  Separator,
} from './styles';

interface MemberActionMenuProps {
  visible: boolean;
  member: ClubMember | null;
  currentUserId: string;
  onClose: () => void;
  onPromote: (member: ClubMember) => void;
  onDemote: (member: ClubMember) => void;
  onRemove: (member: ClubMember) => void;
  onBlock: (member: ClubMember) => void;
}

export const MemberActionMenu = ({
  visible,
  member,
  currentUserId,
  onClose,
  onPromote,
  onDemote,
  onRemove,
  onBlock,
}: MemberActionMenuProps) => {
  if (!member) return null;

  const isTargetAdmin =
    member.role === ClubRole.CLUBADMINROLE ||
    member.role === ClubRole.CLUBOWNERROLE;
  const isTargetOwner = member.role === ClubRole.CLUBOWNERROLE;
  const isTargetMember = member.role === ClubRole.CLUBMEMBERROLE;
  const isTargetCurrentUser = member.userId === currentUserId;

  const handlePromote = () => {
    onPromote(member);
    onClose();
  };

  const handleDemote = () => {
    onDemote(member);
    onClose();
  };

  const handleRemove = () => {
    onRemove(member);
    onClose();
  };

  const handleBlock = () => {
    onBlock(member);
    onClose();
  };

  // If viewing own card as admin (not owner), show self-management options
  if (isTargetCurrentUser && isTargetAdmin && !isTargetOwner) {
    return (
      <ModalBottom visible={visible} onBackButtonPress={onClose}>
        <MenuContainer>
          <MenuHeader>
            <Text bold size={18} color="white">
              @{member.user?.username}
            </Text>
          </MenuHeader>

          <MenuOption onPress={handleDemote}>
            <Icon name="star" size={22} color="grey200" />
            <MenuOptionText>
              <Text size={16} color="white">Remove My Admin Role</Text>
            </MenuOptionText>
          </MenuOption>

          <Separator />

          <MenuOption onPress={handleRemove}>
            <Icon name="exit" size={22} color="danger500" />
            <MenuOptionText>
              <Text size={16} color="danger500">
                Leave Club
              </Text>
            </MenuOptionText>
          </MenuOption>
        </MenuContainer>
      </ModalBottom>
    );
  }

  // Don't show menu if viewing own card (owner case is handled by not showing menu button)
  if (isTargetCurrentUser) {
    return null;
  }

  return (
    <ModalBottom visible={visible} onBackButtonPress={onClose}>
      <MenuContainer>
        <MenuHeader>
          <Text bold size={18} color="white">
            @{member.user?.username}
          </Text>
        </MenuHeader>

        {isTargetMember && (
          <MenuOption onPress={handlePromote}>
            <Icon name="star" size={22} color="primary500" />
            <MenuOptionText>
              <Text size={16} color="white">Make Admin</Text>
            </MenuOptionText>
          </MenuOption>
        )}

        {isTargetAdmin && !isTargetOwner && (
          <MenuOption onPress={handleDemote}>
            <Icon name="star" size={22} color="grey200" />
            <MenuOptionText>
              <Text size={16} color="grey200">Remove Admin</Text>
            </MenuOptionText>
          </MenuOption>
        )}

        <Separator />

        <MenuOption onPress={handleRemove}>
          <Icon name="exit" size={22} color="danger500" />
          <MenuOptionText>
            <Text size={16} color="danger500">
              Remove from Club
            </Text>
          </MenuOptionText>
        </MenuOption>

        <MenuOption onPress={handleBlock}>
          <Icon name="lock" size={22} color="danger500" />
          <MenuOptionText>
            <Text size={16} color="danger500">
              Block from Club
            </Text>
          </MenuOptionText>
        </MenuOption>
      </MenuContainer>
    </ModalBottom>
  );
};
