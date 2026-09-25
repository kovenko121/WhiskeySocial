import {
  ImageProps,
  PressableProps,
  TextProps,
  ViewProps,
} from 'react-native';
import styled, { css } from 'styled-components/native';

export const Container = styled.View<ViewProps>`
  ${({ theme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(12)}px;
    margin-top: ${theme.metrics.px(8)}px;
  `}
`;

export const LogoTile = styled.View<ViewProps>`
  ${({ theme }) => css`
    width: ${theme.metrics.px(48)}px;
    height: ${theme.metrics.px(48)}px;
    border-radius: ${theme.metrics.px(8)}px;
    align-items: center;
    justify-content: center;
    padding: ${theme.metrics.px(2)}px;
    background-color: ${theme.colors.white};
    overflow: hidden;
  `}
`;

export const Logo = styled.Image<ImageProps>`
  width: 100%;
  height: 100%;
`;

export const Info = styled.View<ViewProps>`
  flex: 1;
`;

export const EventName = styled.Text<TextProps>`
  ${({ theme }) => css`
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(18)}px;
    color: ${theme.colors.white};
  `}
`;

export const SubLine = styled.Text<TextProps>`
  ${({ theme }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(11)}px;
    color: ${theme.colors.grey200};
    margin-top: ${theme.metrics.px(2)}px;
  `}
`;

export const HelpButton = styled.Pressable<PressableProps>`
  ${({ theme }) => css`
    width: ${theme.metrics.px(22)}px;
    height: ${theme.metrics.px(22)}px;
    border-radius: ${theme.metrics.px(11)}px;
    align-items: center;
    justify-content: center;
    border-width: 1.5px;
    border-color: ${theme.colors.primary500};
  `}
`;

export const HelpMark = styled.Text<TextProps>`
  ${({ theme }) => css`
    font-family: ${theme.fonts.bold};
    font-size: ${theme.metrics.px(12)}px;
    color: ${theme.colors.primary500};
  `}
`;
