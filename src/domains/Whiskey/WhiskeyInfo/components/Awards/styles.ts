import styled, { css, DefaultTheme } from 'styled-components/native';


export const TextSection = styled.View`
  ${({ theme, mb }: { theme: DefaultTheme; mb?: number }) => css`
    height: 100%;
    width: 100%;
    justify-content: space-between;
    padding-bottom: ${theme.metrics.hp(mb || 0)}px;
  `}
`;

export const AwardsFlatList = styled.FlatList`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.hp(1)}px;
  `}
`;