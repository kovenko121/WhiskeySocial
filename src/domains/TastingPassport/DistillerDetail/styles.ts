import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const Scroll = styled.ScrollView`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    width: 100%;
    /* Header bottom padding, consistent with the Passport / Leaderboard screens. */
    margin-top: ${theme.metrics.px(12)}px;
  `}
`;

export const Body = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-bottom: ${theme.metrics.px(40)}px;
  `}
`;

export const BrandHead = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(14)}px;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;

export const BrandHeadInfo = styled.View`
  flex: 1;
`;

export const BrandName = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(26)}px;
    color: ${theme.colors.white};
  `}
`;

export const BrandLocation = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(13)}px;
    color: ${theme.colors.grey200};
    margin-top: ${theme.metrics.px(2)}px;
  `}
`;

export const ToggleRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(8)}px;
    margin-top: ${theme.metrics.px(20)}px;
  `}
`;

export const SectionLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.white};
    margin-top: ${theme.metrics.px(24)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const EmptyPours = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(13)}px;
    color: ${theme.colors.grey200};
  `}
`;

export const NotesInput = styled.TextInput.attrs(({ theme }: { theme: DefaultTheme }) => ({
  placeholderTextColor: theme.colors.grey200,
  multiline: true,
  textAlignVertical: 'top',
}))`
  ${({ theme }: { theme: DefaultTheme }) => css`
    min-height: ${theme.metrics.px(64)}px;
    background-color: ${theme.colors.white};
    border-radius: ${theme.metrics.px(8)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.primary500};
    padding: ${theme.metrics.px(12)}px;
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.grey600};
  `}
`;

export const EmailRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;

export const EmailLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.grey70};
  `}
`;
