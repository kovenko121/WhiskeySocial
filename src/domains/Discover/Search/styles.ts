import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    justify-content: flex-start;
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.metrics.px(12)}px;
    flex: 1;
    margin-top: ${theme.metrics.px(50)}px;
  `}
`;

export const ScreenPadding = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    padding-left: ${theme.metrics.px(24)}px;
  `}
`;

export const IconContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(60)}px;
    height: ${theme.metrics.px(170)}px;
    width: 100%;
    justify-content: center;
    align-items: center;
  `}
`;

export const ListContainer = styled.View`
  flex: 1;
  width: 100%;
`;

export const InputContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    flex-direction: column;
    justify-content: center;
    min-height: ${theme.metrics.px(60)}px;
  `}
`;

export const SearchContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: row;
    min-height: ${theme.metrics.px(60)}px;
    padding-right: ${theme.metrics.px(24)}px;
  `}
`;

export const Loading = styled.ActivityIndicator.attrs(({ theme }: { theme: DefaultTheme }) => ({
  color: theme.colors.primary,
}))`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(4)}px;
  `}
`;

export const IconButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-right: ${theme.metrics.px(12)}px;
    padding-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const SearchTypeBar = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.metrics.px(18)}px;
  `}
`;

export const SearchTypeText = styled.Text.attrs({
  allowFontScaling: false,
})`
  ${({ theme, disabled }: { theme: DefaultTheme; disabled?: boolean }) => css`
    font-family: ${theme?.fonts.bold};
    font-size: ${theme?.metrics.px(14)}px;
    color: ${disabled ? theme?.colors.grey300 : theme.colors.white};
  `}
`;

export const SearchTypeButton = styled.TouchableOpacity`
  ${({ theme, selected }: { theme: DefaultTheme; selected?: boolean }) => css`
    border-bottom-width: ${theme.metrics.px(selected ? 1 : 0)}px;
    border-bottom-color: ${theme.colors.primary};
    padding-vertical: ${theme.metrics.px(4)}px;
  `}
`;

export const LinkButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: ${theme.metrics.px(10)}px;
    padding-vertical: ${theme.metrics.px(4)}px;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.hp(10)}px;
  `}
`;

export const FilterSection = styled.View`
  ${({
    theme,
    isFavorite = false,
  }: {
    theme: DefaultTheme;
    isFavorite: boolean;
  }) => css`
    align-items: left;
    ${isFavorite ? `margin-bottom: ${theme.metrics.px(8)}px;` : ''}
  `}
`;

export const ScanRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(8)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;
