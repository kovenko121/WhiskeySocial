import styled, { DefaultTheme } from 'styled-components/native';

export const MenuContainer = styled.View`
  padding-bottom: 16px;
`;

export const MenuHeader = styled.View`
  padding: 32px 16px 16px 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.grey500};
`;

export const MenuOption = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 16px 20px;
  background-color: transparent;
`;

export const MenuOptionText = styled.View`
  margin-left: 16px;
  flex: 1;
`;

export const MuteRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 16px 20px;
`;

export const MuteTextContainer = styled.View`
  margin-left: 16px;
  flex: 1;
`;

export const Separator = styled.View`
  height: 1px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.grey500};
  margin: 8px 0;
`;
