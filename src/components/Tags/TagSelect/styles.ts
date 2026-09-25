import { FlatList } from 'react-native';
import styled, { DefaultTheme, css } from 'styled-components/native';

export const SelectTagsContainer = styled.View`
  ${({ theme, mv }: { theme: DefaultTheme; mv: number }) => css`
    align-items: center;
    justify-content: center;
    margin-vertical: ${theme.metrics.px(mv)}px;
  `}
`;

export const SelectTags = styled(FlatList as typeof FlatList<string>).attrs({
  scrollEnabled: false,
  numColumns: 4,
})``;

export const TagButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    margin: ${theme.metrics.px(4)}px;
  `}
`;
