import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const InputContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    min-height: ${theme.metrics.px(60)}px;
    margin-top: ${theme.metrics.px(16)}px;
  `}
`;

export const ListContainer = styled.View`
  flex: 1;
  width: 100%;
`;

export const SelectedSection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(16)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const SelectedLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(14)}px;
    font-weight: 600;
    color: ${theme.colors.grey200};
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const NotesSection = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(16)}px;
  `}
`;

export const NotesLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(14)}px;
    font-weight: 600;
    color: ${theme.colors.grey200};
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const NotesInput = styled.TextInput`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.grey400};
    border-radius: ${theme.metrics.px(12)}px;
    padding: ${theme.metrics.px(12)}px;
    color: ${theme.colors.white};
    font-size: ${theme.metrics.px(14)}px;
    min-height: ${theme.metrics.px(80)}px;
    text-align-vertical: top;
  `}
`;

export const CharacterCount = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(12)}px;
    color: ${theme.colors.grey300};
    text-align: right;
    margin-top: ${theme.metrics.px(4)}px;
  `}
`;

export const SearchResultsLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(14)}px;
    font-weight: 600;
    color: ${theme.colors.grey200};
    margin-top: ${theme.metrics.px(16)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.hp(10)}px;
  `}
`;

export const LoadingOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

export const AddButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(24)}px;
    align-items: center;
  `}
`;
