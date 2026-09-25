import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    margin-vertical: ${theme.metrics.px(30)}px;
  `}
`;

export const BottomButtonWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-vertical: ${theme.metrics.px(18)}px;
    padding-bottom: ${theme.metrics.px(28)}px;
    gap: ${theme.metrics.px(10)}px;
  `}
`;

export const InfoContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(50)}px;
  `}
`;

export const InfoWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    gap: ${theme.metrics.px(15)}px;
  `}
`;

export const SectionTitleWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(65)};
  `}
`;

export const TextWrapper = styled.View`
  flex: 1;
`;
