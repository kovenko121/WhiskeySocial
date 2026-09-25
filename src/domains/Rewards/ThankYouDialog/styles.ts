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

export const RewardImageContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    margin-top: ${theme.metrics.px(60)}px;
    width: 100%;
  `}
`;

export const TitleContainer = styled.View`
${({ theme }: { theme: DefaultTheme }) => css`
  align-items: center;
  width: 100%;
  margin-top: ${theme.metrics.px(10)}px;
  `}
`;

export const SubtitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-horizontal: ${theme.metrics.px(20)}px;
    align-items: center;
    width: 100%;
  `}
`;

export const RewardImage = styled.Image`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    width: ${theme.metrics.px(100)}px;
    height: ${theme.metrics.px(108)}px;
  `}
`;
