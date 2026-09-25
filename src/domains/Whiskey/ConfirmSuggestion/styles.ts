import styled, { css, DefaultTheme } from 'styled-components/native';

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    justify-content: flex-start;
    padding-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const ContentContainer = styled.SafeAreaView`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: 100%;
    height: 100%;
    margin-top: ${theme.metrics.px(40)}px;
  `}
`;

export const BottomButtonWrapper = styled.View`
    ${({ theme }: { theme: DefaultTheme }) => css`
    margin-vertical: ${theme.metrics.px(18)}px;
    padding-bottom: ${theme.metrics.px(28)}px;
    flex-direction: row;
    gap: ${theme.metrics.px(10)}px;
  `}
`;

export const TitleContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.px(80)}px;
    justify-content: space-between;
  `}
`;

export const ImageContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-vertical: ${theme.metrics.px(20)}px;
    height: ${theme.metrics.px(246)}px;
    width: 100%;
    background-color: ${theme.colors.red};
  `}
`;

export const Image = styled.Image.attrs({
  resizeMode: 'cover'
})`
  height: 100%;
  width: 100%;
`;

export const DataContainer = styled.View`
  width: 100%;
`;

export const Field = styled.View`
    width: 100%;
    flex-direction: row;
`;

export const Spacing = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(90)}px;
  `}
`;

export const ButtonWrapper = styled.View`
  display: flex;
  flex: 1;
`;