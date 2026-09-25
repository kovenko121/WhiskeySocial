import styled, { css, DefaultTheme } from 'styled-components/native';
import { Text as BaseText } from '../Text/Text';

type ActiveProps = {
  theme: DefaultTheme;
  active?: boolean;
};

export const Container = styled.SafeAreaView`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    text-align: center;
    background-color: ${theme.colors.grey600};
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-end;
    padding: ${theme.metrics.px(0)}px 0 ${theme.metrics.px(20)}px;
    border-top-left-radius: ${theme.metrics.px(16)}px;
    border-top-right-radius: ${theme.metrics.px(16)}px;
  `}
`;

export const Text = styled(BaseText)`
  ${({ theme, active = false }: ActiveProps) => css`
    text-transform: capitalize;
    color: ${active ? theme.colors.primary : theme.colors.grey400};
    font-size: ${theme.metrics.px(10)}px;
    margin-top: ${theme.metrics.px(4)}px;
  `}
`;

export const IconContainer = styled.TouchableOpacity`
  ${({ theme, active = false }: ActiveProps) => css`
    flex: 1;
    justify-content: center;
    align-items: center;
    width: 18%;
    padding-top: 10px;
    color: ${active ? theme.colors.black : theme.colors.grey500};
  `}
`;

export const ActiveBar = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.primary};
    height: ${theme.metrics.px(4)}px;
    width: ${theme.metrics.px(32)}px;
    border-radius: ${theme.metrics.px(2)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;
