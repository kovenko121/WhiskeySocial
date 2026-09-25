import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    background-color: ${theme.colors.backgroundDark};
    flex: 1;
    padding-horizontal: 24px;
    padding-top: 35px;
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin-top: ${theme.metrics.hp(8)}px;
  `}
`;

export const InputContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    justify-content: center;
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

// The container is a KeyboardAvoidingView to help make the android keyboard work almost like iOS
// this still isn't 1 to 1 with iOS, but it is close
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
    background-color: ${theme.colors.backgroundDark};
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
export const LinkContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: flex-end;
    align-items: center;
    padding-vertical: ${theme.metrics.px(20)}px;
  `}
`;
