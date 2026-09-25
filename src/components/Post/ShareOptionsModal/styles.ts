import styled, { css, DefaultTheme } from 'styled-components/native';

export const OptionsContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    padding: ${theme.metrics.px(20)}px;
    gap: ${theme.metrics.px(16)}px;
  `}
`;

export const OptionButton = styled.TouchableOpacity.attrs({
  activeOpacity: 0.7,
})`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.grey800};
    border-radius: ${theme.metrics.px(12)}px;
    padding: ${theme.metrics.px(16)}px;
  `}
`;

export const OptionContent = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(16)}px;
  `}
`;

export const OptionIconContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    width: ${theme.metrics.px(48)}px;
    height: ${theme.metrics.px(48)}px;
    background-color: ${theme.colors.grey700};
    border-radius: ${theme.metrics.px(24)}px;
    align-items: center;
    justify-content: center;
  `}
`;

export const OptionTextContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    gap: ${theme.metrics.px(4)}px;
  `}
`;
