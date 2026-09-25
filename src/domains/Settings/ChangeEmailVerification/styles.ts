import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex: 1;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin-top: ${theme.metrics.hp(15)}px;
  `}
`;

export const InputContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    justify-content: center;
    margin-vertical: ${theme.metrics.px(4)}px;
    margin-top: ${theme.metrics.px(50)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
    width: 80%;
  `}
`;

export const SubtitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: column;
    margin-bottom: ${theme.metrics.px(20)}px;
    margin-top: ${theme.metrics.px(16)}px;
  `}
`;

export const ButtonContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-vertical: 10px;
    flex-direction: column;
    justify-content: flex-end;
  `}
`;

export const BottomButtonWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-top: ${theme.metrics.px(0)}px;
    display: flex;
    flex-direction: row;
    gap: 12px;
  `}
`;

export const ErrorContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: column;
    margin-bottom: ${theme.metrics.px(16)}px;
  `}
`;

export const IconWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    justify-content: center;
    align-items: center;
    padding-vertical: ${theme.metrics.px(8)}px;
    padding-horizontal: ${theme.metrics.px(20)}px;
  `}
`;
