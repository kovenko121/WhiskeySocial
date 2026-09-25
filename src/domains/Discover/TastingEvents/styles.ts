import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const Scroll = styled.ScrollView`
  flex: 1;
`;

export const Body = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(12)}px;
    padding-top: ${theme.metrics.px(16)}px;
    padding-bottom: ${theme.metrics.px(32)}px;
  `}
`;

export const EmptyText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(14)}px;
    line-height: ${theme.metrics.px(20)}px;
    color: ${theme.colors.grey100};
    margin-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const SectionHeading = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(24)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
    margin-horizontal: ${theme.metrics.px(24)}px;
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(18)}px;
    color: ${theme.colors.grey50};
  `}
`;
