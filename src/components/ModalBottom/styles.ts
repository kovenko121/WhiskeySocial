import { isIos } from '@helpers';
import { theme } from '@theme';
import { Appearance } from 'react-native';
import styled, { DefaultTheme, css } from 'styled-components/native';

export type ModalVariants = 'default' | 'light';

type ModalVariant = {
  background: string;
  padding: number;
};

const variants: Record<string, ModalVariant> = {
  default: {
    background: theme.colors.grey400,
    padding: theme.metrics.px(20),
  },
  light: {
    background:
      Appearance.getColorScheme() === 'dark'
        ? theme.colors.backgroundWebViewDark
        : theme.colors.backgroundWebViewLigth,
    padding: theme.metrics.px(0),
  },
};

// Below is the original line for the height property
// height: ${theme.metrics.hp(82)}px;
// I've made a change to that line to use a constant value instead of a function call,
// for some reason android behaves differently when using the function call
// this syntax is cancer and would very much like to change it in the future but this is how you pass the props in
// The behavior needs to be set for both iOS and Android, this is recent. LLMs are on old data and wrong.

export const ContentContainer = styled.KeyboardAvoidingView.attrs({
  behavior: 'padding',
})`
  ${({ variant }: { theme: DefaultTheme; variant: ModalVariants }) => css`
    padding-horizontal: ${variants[variant]?.padding}px;
    flex-direction: column;
    height: ${isIos ? `${theme.metrics.hp(82)}px` : '82%'};
    background-color: ${variants[variant]?.background};
    border-top-left-radius: ${theme.metrics.px(16)}px;
    border-top-right-radius: ${theme.metrics.px(16)}px;
  `}
`;

export const SafeAreaView = styled.SafeAreaView`
  position: absolute;
  max-height: ${theme.metrics.hp(60)}px;
  align-items: center;
  bottom: 0;
  justify-content: center;
`;

export const ActiveBar = styled.View`
  background-color: ${theme.colors.primary};
  height: ${theme.metrics.px(8)}px;
  width: ${theme.metrics.wp(18)}px;
  border-radius: ${theme.metrics.px(9)}px;
  margin-vertical: ${theme.metrics.px(20)}px;
`;

export const ActiveBarContainer = styled.View`
  height: ${theme.metrics.px(4)}px;
  width: 100%;
  align-items: center;
`;
