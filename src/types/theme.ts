import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      backgroundLight: string;
      backgroundDark: string;
      backgroundWebViewLigth: string;
      backgroundWebViewDark: string;
      grey25: string;
      grey50: string;
      grey70: string;
      grey75: string;
      grey100: string;
      grey200: string;
      grey300: string;
      grey400: string;
      grey500: string;
      grey600: string;
      grey700: string;
      grey800: string;
      grey900: string;
      primary50: string;
      primary100: string;
      primary200: string;
      primary300: string;
      primary400: string;
      primary500: string;
      primary600: string;
      primary700: string;
      primary800: string;
      primary900: string;
      secondary300: string;
      warning: string;
      danger500: string;
      warning200: string;
      warning300: string;
      neutral300: string;
      neutral600: string;
      white: string;
      black: string;
      black700: string;
      black300: string;
      red: string;
      toGoGreen: string;
      pink: string;
      darkOpacity: string;
      transparent: string;
    };
    metrics: {
      wp: (widthPercent: number) => number;
      hp: (heightPercent: number) => number;
      px: (valuePx: number) => number;
      width: number;
      height: number;
      touchableMinHeight: number;
      touchableMinWidth: number;
    };
    fonts: {
      title: string;
      regular: string;
      semibold: string;
      bold: string;
    };
  }
}
