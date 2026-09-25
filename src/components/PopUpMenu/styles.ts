import OutsidePressHandler from 'react-native-outside-press';
import styled, { css, DefaultTheme } from 'styled-components/native';

type ActiveProps = {
  theme: DefaultTheme;
  active?: boolean;
  top?: boolean;
  reverse?: boolean;
};

export const Button = styled.TouchableOpacity`
  ${({ theme, reverse }: ActiveProps) => css`
    padding-vertical: ${theme.metrics.px(10)}px;
    flex-direction: row;
    background-color: ${theme.colors.grey300};
    width: 100%;
    justify-content: ${reverse ? 'flex-end' : 'flex-start'};
  `}
`;

export const ButtonContainer = styled(OutsidePressHandler)`
  ${({ theme, width }: ActiveProps) => css`
    overflow: hidden;
    width: ${width}%;
    align-items: flex-start;
    border-radius: ${theme.metrics.px(8)}px;
    background-color: ${theme.colors.backgroundDark};
  `}
`;

export const IconContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(24)}px;
    align-items: center;
  `}
`;

export const ButtonSection = styled.View`
  ${({
    theme,
    alignItems,
    paddingBottom,
    paddingLeft,
  }: {
    theme: DefaultTheme;
    paddingBottom: number;
    paddingLeft: number;
    alignItems: string;
  }) => css`
    width: 100%;
    flex-direction: column;
    top: ${theme.metrics.px(paddingBottom)}px;
    left: ${theme.metrics.px(paddingLeft)}px;
    position: absolute;
    align-items: ${alignItems};
    z-index: 1;
  `}
`;

export const ActivityIndicatorContainer = styled.View`
  width: 100%;
  align-items: center;
  justify-content: center;
`;

export const TextContainer = styled.View`
  ${({ theme, reverse }: { theme: DefaultTheme; reverse: boolean }) => css`
    margin-left: ${theme.metrics.px(10)}px;
    flex-direction: ${reverse ? 'row-reverse' : 'row'};
    gap: ${theme.metrics.px(10)}px;
  `}
`;
