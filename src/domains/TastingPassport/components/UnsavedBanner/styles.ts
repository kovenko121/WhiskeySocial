import styled, { css, DefaultTheme } from 'styled-components/native';

export const Banner = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    margin-top: ${theme.metrics.px(12)}px;
    padding-vertical: ${theme.metrics.px(10)}px;
    padding-horizontal: ${theme.metrics.px(14)}px;
    border-radius: ${theme.metrics.px(10)}px;
    border-width: ${theme.metrics.px(1)}px;
    border-color: ${theme.colors.danger500};
  `}
`;

export const Message = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(13)}px;
    line-height: ${theme.metrics.px(18)}px;
    color: ${theme.colors.grey50};
    padding-right: ${theme.metrics.px(12)}px;
  `}
`;

export const RetryButton = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-vertical: ${theme.metrics.px(6)}px;
    padding-horizontal: ${theme.metrics.px(10)}px;
  `}
`;

export const RetryLabel = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(14)}px;
    color: ${theme.colors.warning};
  `}
`;
