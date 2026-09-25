import styled, { css, DefaultTheme } from 'styled-components/native';

export const Container = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    background-color: ${theme.colors.grey400};
    border-radius: ${theme.metrics.px(12)}px;
    padding-horizontal: ${theme.metrics.px(12)}px;
    padding-vertical: ${theme.metrics.px(12)}px;
    margin-horizontal: ${theme.metrics.px(24)}px;
    margin-vertical: ${theme.metrics.px(16)}px;
  `}
`;

export const TextContainer = styled.View`
  flex: 1;
  margin-horizontal: 12px;
`;

export const PlaceholderText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.grey200};
  `}
`;

export const IconContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(36)}px;
    height: ${theme.metrics.px(36)}px;
    border-radius: ${theme.metrics.px(18)}px;
    background-color: ${theme.colors.grey300};
    justify-content: center;
    align-items: center;
  `}
`;
