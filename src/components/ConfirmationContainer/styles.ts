import styled, { css, DefaultTheme } from 'styled-components/native';

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: ${theme.metrics.px(60)}px;
  `}
`;

export const SubtitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: column;
    margin-bottom: ${theme.metrics.px(20)}px;
    margin-top: ${theme.metrics.px(16)}px;
  `}
`;
