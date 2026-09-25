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
  align-items: center;
  width: 100%;
`;

export const TitleContainer = styled.View`
  align-items: center;
  width: 100%;
`;

export const SubtitleContainer = styled.View`
  align-items: center;
  width: 100%;
`;

export const CardsList = styled.FlatList`
  width: 100%;
`;

export const Card = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: flex-start;
    flex-direction: column;
    width: ${theme.metrics.wp(26)}px;
    height: ${theme.metrics.px(130)}px;
    border-radius: ${theme.metrics.px(8)}px;
    border-color: ${theme.colors.primary};
    border-width: ${theme.metrics.px(1)}px;
    margin-right: ${theme.metrics.px(16)}px;
    padding-horizontal: ${theme.metrics.px(8)}px;
    padding-vertical: ${theme.metrics.px(8)}px;
    gap: ${theme.metrics.px(4)}px;
  `}
`;
