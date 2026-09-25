import styled, { css, DefaultTheme } from 'styled-components/native';

export const ContentContainer = styled.SafeAreaView`
  overflow: hidden;
  align-items: center;
  justify-content: center;
`;

export const CrownWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(150)}px;
    height: ${theme.metrics.px(110)}px;
    position: absolute;
    z-index: 3;
  `}
`;

export const Crown = styled.Image`
  width: 100%;
  height: 100%;
`;

export const TransparencyView = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.primary500};
    opacity: 0.2;
    z-index: 1;
    width: ${theme.metrics.px(150)}px;
    height: ${theme.metrics.px(110)}px;
  `}
`;
