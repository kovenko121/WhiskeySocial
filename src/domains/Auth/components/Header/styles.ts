import styled, { css, DefaultTheme } from 'styled-components/native';

export const LogoImageComponent = styled.Image`
  width: 70%;
`;

export const LogoWrapper = styled.View`
  align-items: center;
  width: 90%;
`;

export const IconContainer = styled.TouchableOpacity`
  margin-top: 25px;
  max-width: 20px;
  min-width: 20px;
`;

export const HeaderContainer = styled.View`
  ${({
    theme,
    mt,
    mb,
  }: {
    theme: DefaultTheme;
    mt?: number;
    mb?: number;
  }) => css`
    flex-direction: row;
    width: 100%;
    margin-top: ${theme.metrics.px(mt || 0)}px;
    margin-bottom: ${theme.metrics.px(mb || 0)}px;
    justify-content: flex-start;
  `}
`;
