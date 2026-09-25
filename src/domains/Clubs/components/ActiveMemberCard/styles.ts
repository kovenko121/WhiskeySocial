import styled from 'styled-components/native';

export const CardContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.grey400};
  border-radius: 12px;
  margin-bottom: 8px;
`;

export const CardContent = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

export const Avatar = styled.Image`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.grey500};
`;

export const AvatarPlaceholder = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.grey500};
  align-items: center;
  justify-content: center;
`;

export const UserInfo = styled.View`
  flex: 1;
  margin-left: 12px;
`;

export const RoleBadge = styled.View`
  margin-top: 4px;
`;

export const MenuButton = styled.TouchableOpacity`
  padding: 8px;
  margin-left: 8px;
`;
