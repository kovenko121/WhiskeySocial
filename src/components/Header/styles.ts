import { androidTop, isIos } from '@helpers';
import { ViewProps } from 'react-native';
import styled, { DefaultTheme, css } from 'styled-components/native';

export const HeaderContainer = styled.SafeAreaView<ViewProps & { absolute?: boolean }>`
  ${({
    theme,
    absolute = false,
  }) => css`
    flex-direction: row;
    align-items: center;
    padding-top: ${theme.metrics.px((isIos ? 0 : androidTop) as number)}px;
    z-index: ${absolute ? 100 : 0};
  `}
`;

export const TitleSection = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const IconContainer = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(27)}px;
    flex: 1;
    justify-content: center;
    margin-top: ${theme.metrics.px(10)}px;
  `}
`;

export const ActivityIndicatorContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(27)}px;
    justify-content: center;
    margin-top: ${theme.metrics.px(10)}px;
  `}
`;

export const Section = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    align-items: center;
    min-width: ${theme.metrics.px(70)}px;
  `}
`;
