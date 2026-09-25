import styled, { css, DefaultTheme } from 'styled-components/native';

export const TagContainer = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: row;
    flex-shrink: 1;
    gap: ${theme.metrics.px(5)}px;
    align-items: center;
    justify-content: space-between;
    background-color: ${theme.colors.transparent};
    height: ${theme.metrics.px(26)}px;
    min-width: ${theme.metrics.px(0)}px;
    border-width: 1px;
    border-radius: ${theme.metrics.px(37)}px;
    padding-horizontal: ${theme.metrics.px(10)}px;
    border-color: ${theme.colors.primary500};
  `}
`;

export const IconContainer = styled.View``;

export const DropDownContainer = styled.View``;
