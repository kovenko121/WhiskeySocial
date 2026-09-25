import styled, { css, DefaultTheme } from 'styled-components/native';

export const SafeArea = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    background-color: ${theme.colors.backgroundDark};
    height: 100%;
    width: 100%;
    align-items: center;
    justify-content: center;
  `}
`;

export const SponsorContainer = styled.View`
  align-items: center;
  position: absolute;
  bottom: ${({ theme }: { theme: DefaultTheme }) => theme.metrics.hp(10)}px;
  width: 100%;
  align-items: center;
  justify-content: center;
`;
