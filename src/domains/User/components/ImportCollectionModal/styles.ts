import styled, { css, DefaultTheme } from 'styled-components/native';

export const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 54px;
  padding-bottom: 24px;
`;

export const HeaderTitle = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(16)}px;
    font-weight: 600;
    color: ${theme.colors.white};
    text-align: center;
  `}
`;

export const Section = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(12)}px;
    margin-bottom: ${theme.metrics.px(16)}px;
  `}
`;

export const TemplateLink = styled.TouchableOpacity``;

export const FileNameRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(8)}px;
    padding-horizontal: ${theme.metrics.px(4)}px;
  `}
`;

export const FileNameText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    color: ${theme.colors.white};
    font-size: ${theme.metrics.px(13)}px;
    flex: 1;
  `}
`;

export const Footer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(12)}px;
    margin-top: ${theme.metrics.px(8)}px;
    margin-bottom: ${theme.metrics.px(24)}px;
  `}
`;

export const ResultRow = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding-vertical: ${theme.metrics.px(16)}px;
  `}
`;

export const ErrorList = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    gap: ${theme.metrics.px(6)}px;
  `}
`;

export const ErrorItem = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: rgba(255, 255, 255, 0.08);
    border-radius: ${theme.metrics.px(6)}px;
    padding: ${theme.metrics.px(8)}px ${theme.metrics.px(10)}px;
  `}
`;
