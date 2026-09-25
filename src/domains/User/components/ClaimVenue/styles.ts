import styled, { css, DefaultTheme } from 'styled-components/native';

export const ClaimVenueContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    border-top-width: 1px;
    border-top-color: ${theme.colors.grey400};
    padding-top: ${theme.metrics.px(42)}px;
    margin-top: ${theme.metrics.px(10)}px;
    padding-vertical: ${theme.metrics.px(10)}px;
    margin-horizontal: ${theme.metrics.px(24)}px;
    align-items: center;
  `}
`;
