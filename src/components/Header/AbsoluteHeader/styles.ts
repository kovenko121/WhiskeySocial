import { androidTop, isAndroid } from '@helpers';
import styled, { css, DefaultTheme } from 'styled-components/native';

export const HeaderContainer = styled.SafeAreaView`
  width: 95%;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  position: absolute;
  z-index: 1;
  padding-top: ${({ theme }: { theme: DefaultTheme }) => theme.metrics.px(isAndroid ? androidTop : 0)}px;
`;

export const RightActionsContainer = styled.View`
  align-items: flex-end;
`;

export const IconContainer = styled.Pressable`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: relative;
    padding: 10px;
    margin-left: ${theme.metrics.px(25)}px;
    margin-top: 15px;
    border-radius: ${theme.metrics.px(25)}px;
    background: ${theme.colors.grey400};
  `}
`;

export const BadgeContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    position: absolute;
    top: ${theme.metrics.px(-2)}px;
    right: ${theme.metrics.px(-2)}px;
    min-width: ${theme.metrics.px(18)}px;
    height: ${theme.metrics.px(18)}px;
    border-radius: ${theme.metrics.px(9)}px;
    background-color: ${theme.colors.primary};
    align-items: center;
    justify-content: center;
    padding-horizontal: ${theme.metrics.px(4)}px;
    z-index: 1;
  `}
`;
