import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ContentContainer = styled.ScrollView.attrs({
  showHorizontalScrollIndicator: false,
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
    height: ${theme.metrics.hp(70.2)}px;
  `}
`;

export const TitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    width: 100%;
    margin-top: ${theme.metrics.px(32)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const BottomButtonWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-top: ${theme.metrics.px(8)}px;
    height: ${theme.metrics.px(120)}px;
  `}
`;

export const HeaderWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const SubtitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    width: 100%;
    margin-bottom: ${theme.metrics.px(22)}px;
  `}
`;

export const CheckboxContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    width: 100%;
    justify-content: center;
    flex-direction: row;
    margin-top: ${theme.metrics.px(12)}px;
    margin-bottom: ${theme.metrics.px(4)}px;
  `}
`;
