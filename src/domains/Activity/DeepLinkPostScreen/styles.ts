import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    display: flex;
  `}
`;

export const ContentContainer = styled.ScrollView`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    margin-top: ${theme.metrics.px(18)}px;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const LoadingComponentView = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    align-items: center;
    padding-horizontal: ${theme.metrics.px(24)}px;
    height: 100%;
  `}
`;

export const PostContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    margin-top: ${theme.metrics.px(16)}px;
  `}
`;
