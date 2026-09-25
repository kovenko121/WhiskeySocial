import styled, { css, DefaultTheme } from 'styled-components/native';

export const RadioGroupContainer = styled.View`
  ${({ theme, mv }: { theme: DefaultTheme; mv?: number }) => css`
    margin-vertical: ${theme.metrics.px(mv || 0)}px;
    min-height: ${theme.metrics.px(48)}px;
    gap: ${theme.metrics.px(6)}px;
  `}
`;

export const RadioButtonContainer = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    gap: ${theme.metrics.px(18)}px;
  `}
`;

export const Circle = styled.View`
  ${({ theme, active }: { theme: DefaultTheme; active?: boolean }) => css`
    width: ${theme.metrics.px(24)}px;
    height: ${theme.metrics.px(24)}px;
    border-radius: ${theme.metrics.px(12)}px;
    border-color: ${theme.colors.white};
    border-width: ${theme.metrics.px(4)}px;
    background-color: ${active ? theme.colors.primary : theme.colors.white};
  `}
`;
