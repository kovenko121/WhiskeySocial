import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    display: flex;
  `}
`;

export const LoadingContainer = styled.View`
  align-items: center;
  height: 100%;
  width: 100%;
  justify-content: center;
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    margin-top: ${theme.metrics.px(18)}px;
    padding-left: ${theme.metrics.px(24)}px;
    flex-direction: column;
  `}
`;

export const HeaderPadding = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-right: ${theme.metrics.px(24)}px;
  `}
`;

export const InputContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    min-height: ${theme.metrics.px(60)}px;
    margin-top: ${theme.metrics.px(20)}px;
    padding-right: ${theme.metrics.px(24)}px;
  `}
`;

export const ListContainer = styled.View`
  flex: 1;
  width: 100%;
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.hp(10)}px;
  `}
`;

export const VisibilityButtonsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-left: ${theme.metrics.px(4)}px;
    padding-right: ${theme.metrics.px(24)}px;
    flex-direction: row;
    gap: ${theme.metrics.px(10)}px;
    margin-bottom: ${theme.metrics.px(12)}px;
    margin-top: ${theme.metrics.px(6)}px;
    justify-content: space-between;
    z-index: 1;
  `}
`;

export const TagButton = styled.TouchableOpacity``;
