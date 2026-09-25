import styled, { DefaultTheme , css } from 'styled-components/native';

export const BottomButtonWrapper = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    display: flex;
    flex-direction: row;
    margin-bottom: ${theme.metrics.px(55)}px;
    gap: ${theme.metrics.px(10)}px;
  `}
`;

export const ButtonWrapper = styled.View`
  display: flex;
  flex: 1;
`;