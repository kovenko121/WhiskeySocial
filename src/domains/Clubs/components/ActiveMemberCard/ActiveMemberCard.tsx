import { Icon, Text } from '@components';
import { navigateUserProfile } from '@helpers';
import { useAuth } from '@contexts';
import { useProfilePicture } from '@hooks';
import { ClubMember, ClubRole } from '@types';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  CardContainer,
  CardContent,
  UserInfo,
  Avatar,
  AvatarPlaceholder,
  RoleBadge,
  MenuButton,
} from './styles';

const getRoleLabel = (role: ClubRole): string => {
  if (role === ClubRole.CLUBOWNERROLE) {
    return 'Owner';
  }
  if (role === ClubRole.CLUBADMINROLE) {
    return 'Admin';
  }
  return 'Member';
};

interface ActiveMemberCardProps {
  member: ClubMember;
  onMenuPress?: (member: ClubMember) => void;
  showMenu?: boolean;
}

export const ActiveMemberCard = ({
  member,
  onMenuPress,
  showMenu = false,
}: ActiveMemberCardProps) => {
  const navigation = useNavigation();
  const {
    user: { sub },
  } = useAuth();
  const { profilePictureUri } = useProfilePicture(member.user?.profilePicture);

  const handlePress = () => {
    if (member.user?.id) {
      navigateUserProfile(member.user.id, sub, navigation);
    }
  };

  const username = member.user?.username || 'Unknown User';
  const roleLabel = getRoleLabel(member.role);

  return (
    <CardContainer>
      <TouchableOpacity onPress={handlePress} style={{ flex: 1 }}>
        <CardContent>
          {profilePictureUri ? (
            <Avatar source={{ uri: profilePictureUri }} />
          ) : (
            <AvatarPlaceholder>
              <Icon name="user" size={20} color="grey300" />
            </AvatarPlaceholder>
          )}

          <UserInfo>
            <Text bold size={15} color="white" numberOfLines={1}>
              @{username}
            </Text>
            <RoleBadge>
              <Text size={12} color="grey200">
                {roleLabel}
              </Text>
            </RoleBadge>
          </UserInfo>
        </CardContent>
      </TouchableOpacity>

      {showMenu && (
        <MenuButton onPress={() => onMenuPress?.(member)}>
          <Icon name="dot-menu-vertical" size={20} color="grey100" />
        </MenuButton>
      )}
    </CardContainer>
  );
};
