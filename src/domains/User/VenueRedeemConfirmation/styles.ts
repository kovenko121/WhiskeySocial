import { ViewProps } from 'react-native';
import styled, { css } from 'styled-components/native';

export const SafeArea = styled.SafeAreaView`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const ScreenContainer = styled.View<ViewProps>`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-top: ${theme.metrics.px(42)}px;
  `}
`;

export const BottomButtonWrapper = styled.View<ViewProps & { marginBottom: number }>`
  ${({
    theme,
    marginBottom,
  }) => css`
    padding-top: ${theme.metrics.px(8)}px;
    background-color: ${theme.colors.backgroundDark};
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-bottom: ${theme.metrics.px(8)}px;
    margin-bottom: ${theme.metrics.px(marginBottom)}px;
    position: absolute;
    bottom: ${theme.metrics.px(0)}px;
    width: 100%;
  `}
`;
