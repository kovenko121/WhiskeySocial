import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const LiveRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${theme.metrics.px(6)}px;
    /* Header bottom padding, consistent with the Passport / Booth screens. */
    margin-top: ${theme.metrics.px(12)}px;
    margin-bottom: ${theme.metrics.px(8)}px;
  `}
`;

export const Dot = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(6)}px;
    height: ${theme.metrics.px(6)}px;
    border-radius: ${theme.metrics.px(3)}px;
    background-color: ${theme.colors.warning};
  `}
`;

export const LiveText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(11)}px;
    letter-spacing: 0.5px;
    color: ${theme.colors.grey200};
  `}
`;

export const Scroll = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

export const EmptyText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(14)}px;
    line-height: ${theme.metrics.px(20)}px;
    text-align: center;
    color: ${theme.colors.grey200};
    margin-top: ${theme.metrics.px(48)}px;
  `}
`;

export const Body = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(8)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-bottom: ${theme.metrics.px(40)}px;
  `}
`;
