import ExpoCheckbox from 'expo-checkbox';
import styled, { DefaultTheme } from 'styled-components/native';

export const Checkbox = styled(ExpoCheckbox).attrs(({ theme }: { theme: DefaultTheme }) => ({
  color: theme.colors.primary,
  radius: 4,
  containerStyle: { backgroundColor: theme.colors.white },
}))`
  margin-right: 8px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.white};
`;
