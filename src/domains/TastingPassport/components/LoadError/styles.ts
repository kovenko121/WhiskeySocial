import styled, { css, DefaultTheme } from 'styled-components/native';

export const Wrap = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    align-items: center;
    justify-content: center;
    padding-horizontal: ${theme.metrics.px(32)}px;
  `}
`;

export const Title = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(18)}px;
    color: ${theme.colors.grey50};
    text-align: center;
  `}
`;

export const Message = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(10)}px;
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(14)}px;
    line-height: ${theme.metrics.px(20)}px;
    color: ${theme.colors.grey200};
    text-align: center;
  `}
`;

export const RetryButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(20)}px;
    padding-vertical: ${theme.metrics.px(10)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
    border-radius: ${theme.metrics.px(10)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.warning};
  `}
`;

export const RetryLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.warning};
  `}
`;
