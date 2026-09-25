import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentContainer = styled.View`
  flex: 1;
`;

export const PreviewContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    margin-top: ${theme.metrics.px(16)}px;
    margin-bottom: ${theme.metrics.px(16)}px;
  `}
`;

export const Preview = styled.Image`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(110)}px;
    height: ${theme.metrics.px(150)}px;
    border-radius: ${theme.metrics.px(8)}px;
  `}
`;

export const StatusContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(16)}px;
    padding-bottom: ${theme.metrics.px(40)}px;
  `}
`;

export const StatusSpacing = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(16)}px;
  `}
`;

export const LabelSummary = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(12)}px;
  `}
`;

export const ListContainer = styled.View`
  flex: 1;
  width: 100%;
`;

export const BadgeRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    margin-top: ${theme.metrics.px(4)}px;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.hp(6)}px;
  `}
`;

export const BottomButtonWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-bottom: ${theme.metrics.px(24)}px;
  `}
`;
