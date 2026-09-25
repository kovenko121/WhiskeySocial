import styled, { css, DefaultTheme } from 'styled-components/native';

export const ContentContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(22)}px;
    align-items: flex-start;
    width: 100%;
    gap: ${theme.metrics.px(16)}px;
  `}
`;

export const CenterContainer = styled.View`
  align-items: center;
  width: 100%;
`;

export const Empty = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    height: ${theme.metrics.hp(30)}px;
  `}
`;

export const SectionHeader = styled.View`
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.metrics.px(12)}px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.grey5};
`;
