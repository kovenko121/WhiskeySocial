import styled from 'styled-components/native';
import { FlatList, FlatListProps } from 'react-native';
import { ClubMember } from '@types';

export const ScreenContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundDark};
`;

export const ContentContainer = styled.View`
  flex: 1;
`;

export const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const TabsContainer = styled.View`
  flex-direction: row;
  padding: 0 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.grey500};
`;

export const TabContainer = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  padding: 16px 0;
  position: relative;
`;

export const TabText = styled.Text<{ active: boolean }>`
  font-size: 15px;
  font-weight: ${({ active }) => (active ? '700' : '400')};
  color: ${({ theme, active }) => (active ? theme.colors.white : theme.colors.grey300)};
`;

export const ActiveIndicator = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.primary500};
`;

export const Badge = styled.View`
  position: absolute;
  top: 12px;
  right: 20px;
  background-color: ${({ theme }) => theme.colors.danger500};
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
`;

export const BadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  font-weight: 700;
`;

export const MembersList = styled(FlatList).attrs(() => ({}))<FlatListProps<ClubMember>>`
  flex: 1;
  padding: 16px;
`;

export const EmptyContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

export const EmptyText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.grey300};
  margin-top: 16px;
`;

export const FooterLoaderContainer = styled.View`
  padding: 20px;
  align-items: center;
`;

export const SearchContainer = styled.View`
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.backgroundDark};
`;

export const SearchInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.grey400};
  color: ${({ theme }) => theme.colors.white};
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 16px;
`;
