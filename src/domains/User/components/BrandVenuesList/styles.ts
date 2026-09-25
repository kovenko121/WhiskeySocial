import styled, { css, DefaultTheme } from 'styled-components/native';

export const BrandVenuesContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    border-top-width: 1px;
    border-top-color: ${theme.colors.grey400};
    margin-top: ${theme.metrics.px(20)}px;
    padding-top: ${theme.metrics.px(20)}px;
    padding-bottom: ${theme.metrics.px(10)}px;
    margin-horizontal: ${theme.metrics.px(24)}px;
  `}
`;

export const VenueLinkContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-vertical: ${({ theme }) => theme.metrics.px(8)}px;
  background-color: ${({ theme }) => theme.colors.grey800};
  padding: ${({ theme }) => theme.metrics.px(12)}px;
  border-radius: ${({ theme }) => theme.metrics.px(8)}px;
`;

export const TitleContainer = styled.View`
  margin-bottom: ${({ theme }) => theme.metrics.px(8)}px;
`;
