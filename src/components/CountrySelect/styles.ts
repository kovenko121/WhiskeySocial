import styled, { DefaultTheme, css } from 'styled-components/native';

export const Container = styled.TouchableOpacity`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex-direction: row;
    align-items: center;
    background-color: ${theme.colors.white};
    border-right-width: 0.5px;
    border-right-color: ${theme.colors.primary500};
    margin-right: 8px;
    min-height: ${theme.metrics.px(48)}px;
    max-height: ${theme.metrics.px(50)}px;
    padding-left: ${theme.metrics.px(4)}px;
    padding-right: ${theme.metrics.px(8)}px;
    border-top-left-radius: 50px;
    border-bottom-left-radius: 50px;
  `}
`;
