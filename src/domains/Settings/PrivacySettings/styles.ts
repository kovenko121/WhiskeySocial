import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentContainer = styled.ScrollView`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    margin-top: ${theme.metrics.px(20)}px;
  `}
`;

export const SectionContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(10)}px;
  `}
`;

export const OptionContainer = styled.TouchableOpacity<{ selected?: boolean }>`
  ${({ theme, selected }: { theme: DefaultTheme; selected?: boolean }) => css`
    flex-direction: row;
    align-items: center;
    padding-vertical: ${theme.metrics.px(14)}px;
    padding-horizontal: ${theme.metrics.px(16)}px;
    margin-vertical: ${theme.metrics.px(6)}px;
    border-radius: ${theme.metrics.px(12)}px;
    border-width: ${theme.metrics.px(selected ? 2 : 1)}px;
    border-color: ${selected ? theme.colors.primary : theme.colors.grey400};
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const RadioCircleOuter = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(24)}px;
    height: ${theme.metrics.px(24)}px;
    border-radius: ${theme.metrics.px(12)}px;
    border-width: ${theme.metrics.px(2)}px;
    border-color: ${theme.colors.white};
    justify-content: center;
    align-items: center;
  `}
`;

export const RadioCircleInner = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(14)}px;
    height: ${theme.metrics.px(14)}px;
    border-radius: ${theme.metrics.px(7)}px;
    background-color: ${theme.colors.primary};
  `}
`;

export const OptionTextContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    margin-left: ${theme.metrics.px(14)}px;
  `}
`;

export const InfoContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    margin-top: ${theme.metrics.px(20)}px;
    padding-horizontal: ${theme.metrics.px(4)}px;
  `}
`;
