import styled, { css, DefaultTheme } from 'styled-components/native';

export const ItemContainer = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    padding-vertical: ${theme.metrics.px(12)}px;
    padding-horizontal: ${theme.metrics.px(16)}px;
  `}
`;

export const AvatarContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-right: ${theme.metrics.px(12)}px;
  `}
`;

export const ContentContainer = styled.View`
  flex: 1;
  justify-content: center;
`;

export const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const BottomRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: ${theme.metrics.px(4)}px;
  `}
`;

export const UsernameContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

export const RightContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: flex-end;
    margin-left: ${theme.metrics.px(12)}px;
    gap: ${theme.metrics.px(4)}px;
  `}
`;

export const UnreadBadge = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.red};
    border-radius: ${theme.metrics.px(10)}px;
    min-width: ${theme.metrics.px(20)}px;
    height: ${theme.metrics.px(20)}px;
    align-items: center;
    justify-content: center;
    padding-horizontal: ${theme.metrics.px(6)}px;
  `}
`;

export const MuteIconContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-left: ${theme.metrics.px(4)}px;
  `}
`;