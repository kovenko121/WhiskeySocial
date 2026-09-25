import styled, { css, DefaultTheme } from 'styled-components/native';

export const ContentContainer = styled.View`
  width: 100%;
  flex: 1;
  align-items: center;
`;

export const CommentPostContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    justify-content: space-between;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.metrics.px(16)}px;
    margin-top: ${theme.metrics.px(20)}px;
  `}
`;

export const CommentList = styled.FlatList`
  width: 100%;
`;

export const TitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    align-items: center;
    margin-top: ${theme.metrics.px(16)}px;
  `}
`;

export const NewCommentContainer = styled.SafeAreaView`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    flex-direction: column;
    margin-top: ${theme.metrics.px(4)}px;
    padding-top: ${theme.metrics.px(8)}px;
    padding-bottom: ${theme.metrics.px(10)}px;
    border-top-color: ${theme.colors.white};
    border-top-width: ${theme.metrics.px(0.5)}px;
  `}
`;

export const ComposerRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    flex-direction: row;
    align-items: flex-end;
    margin-top: ${theme.metrics.px(4)}px;
    gap: ${theme.metrics.px(4)}px;
  `}
`;

export const PublishRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;

export const CommentInput = styled.TextInput`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    color: ${theme.colors.black700};
    background-color: ${theme.colors.white};
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.primary500};
    border-radius: ${theme.metrics.px(18)}px;
    padding-horizontal: ${theme.metrics.px(14)}px;
    padding-top: ${theme.metrics.px(10)}px;
    padding-bottom: ${theme.metrics.px(10)}px;
    font-size: ${theme.metrics.px(14)}px;
    min-height: ${theme.metrics.px(42)}px;
    max-height: ${theme.metrics.px(86)}px;
  `}
`;

export const InputContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 68%;
    align-items: center;
    justify-content: center;
    min-height: ${theme.metrics.px(60)}px;
  `}
`;

export const Divider = styled.View`
  width: 100%;
  height: 20px;
`;

export const PublishButton = styled.Pressable`
  ${({
    theme,
    disabled,
  }: {
    theme: DefaultTheme;
    disabled?: boolean;
  }) => css`
    flex-direction: row;
    min-height: ${theme.metrics.px(32)}px;
    padding-horizontal: ${theme.metrics.px(16)}px;
    padding-vertical: ${theme.metrics.px(6)}px;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.metrics.px(16)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${disabled ? theme.colors.grey300 : theme.colors.primary500};
    border-style: solid;
    opacity: ${disabled ? 0.5 : 1};
  `}
`;

export const ProfilePictureContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-bottom: ${theme.metrics.px(2)}px;
  `}
`;

export const RestrictedMessageContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: ${theme.metrics.px(20)}px;
    margin-top: ${theme.metrics.px(4)}px;
    border-top-color: ${theme.colors.white};
    border-top-width: ${theme.metrics.px(0.5)}px;
    gap: ${theme.metrics.px(12)}px;
  `}
`;

export const RestrictedMessageText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    color: ${theme.colors.white};
    font-size: 15px;
    text-align: center;
    flex: 1;
    line-height: 20px;
  `}
`;
