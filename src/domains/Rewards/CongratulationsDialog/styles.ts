import styled, { css, DefaultTheme } from 'styled-components/native';

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(22)}px;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    gap: ${theme.metrics.px(16)}px;
  `}
`;

export const ButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    justify-content: flex-end;
    flex: 1;
    padding-bottom: ${theme.metrics.hp(5)}px;
  `}
`;

export const RewardImage = styled.Image`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    width: ${theme.metrics.px(100)}px;
    height: ${theme.metrics.px(108)}px;
  `}
`;

export const RewardImageContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    margin-top: ${theme.metrics.hp(8)}px;
    width: 100%;
  `}
`;

export const TitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    width: 100%;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;

export const SubtitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    width: 100%;
    padding-horizontal: ${theme.metrics.px(70)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const Card = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    height: 10%;
    border-radius: ${theme.metrics.px(8)}px;
    border-color: ${theme.colors.primary};
    border-width: ${theme.metrics.px(1)}px;
    margin-right: ${theme.metrics.px(16)}px;
    padding-horizontal: ${theme.metrics.px(8)}px;
    padding-vertical: ${theme.metrics.px(8)}px;
    gap: ${theme.metrics.px(4)}px;
  `}
`;

export const CardTitle = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: flex-start;
    flex-direction: row;
    gap: ${theme.metrics.px(4)}px;
  `}
`;
