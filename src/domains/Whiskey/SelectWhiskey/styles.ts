import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    justify-content: flex-start;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentContainer = styled.View`
  flex: 1;
`;

export const IconContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.wp(40)}px;
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
    min-height: ${theme.metrics.px(60)}px;
    margin-top: ${theme.metrics.px(20)}px;
  `}
`;

export const Loading = styled.ActivityIndicator.attrs(({ theme }: { theme: DefaultTheme }) => ({
  color: theme.colors.primary,
}))`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(4)}px;
    padding-right: ${theme.metrics.px(24)}px;
    margin-top: ${theme.metrics.px(20)}px;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.hp(10)}px;
  `}
`;

export const ErrorContainer = styled.View`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
`;

export const ScanRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(8)}px;
    margin-top: ${theme.metrics.px(4)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;
