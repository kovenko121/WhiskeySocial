import { FlatList } from 'react-native';
import styled, { DefaultTheme, css } from 'styled-components/native';

export const SelectTagsContainer = styled.View`
  ${({ theme, mv, ml }: { theme: DefaultTheme; mv: number; ml: number }) => css`
    align-items: center;
    justify-content: center;
    flex-direction: row;
    margin-vertical: ${theme.metrics.px(mv)}px;
    margin-left: ${theme.metrics.px(ml)}px;
  `}
`;

export const AllTagButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    margin-right: ${theme.metrics.px(4)}px;
  `}
`;

export const TagButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    margin: ${theme.metrics.px(4)}px;
  `}
`;

export const SearchButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-right: ${theme.metrics.px(8)}px;
  `}
`;

export const SelectTagsList = styled(FlatList as typeof FlatList<string>).attrs(
  {
    horizontal: true,
    showsHorizontalScrollIndicator: false,
  }
)``;

export const Empty = styled.View`
  width: 24px;
`;
