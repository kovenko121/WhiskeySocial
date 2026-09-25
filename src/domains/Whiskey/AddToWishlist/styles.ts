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

export const LoadingComponentView = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(24)}px;
    height: 100%;
  `}
`;

export const InputContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    min-height: ${theme.metrics.px(60)}px;
    margin-top: ${theme.metrics.px(20)}px;
  `}
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.hp(10)}px;
  `}
`;

export const ListContainer = styled.View`
  flex: 1;
  width: 100%;
`;
export const AddToWishListButtonContainer = styled.View`
  align-items: center;
  justify-content: center;
`;

export const AddToWishlistButton = styled.TouchableOpacity`
  ${({
    theme,
    color = 'primary500',
  }: {
    theme: DefaultTheme;
    color?: string;
  }) => css`
    width: ${theme.metrics.px(26)}px;
    height: ${theme.metrics.px(26)}px;
    border-radius: 100px;
    align-items: center;
    justify-content: center;
    background-color: ${color};
  `}
`;
