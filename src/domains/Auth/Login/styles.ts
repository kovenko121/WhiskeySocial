import { BaseText } from '@components';
import styled, { css, DefaultTheme } from 'styled-components/native';
import { colors } from '../../../styles/colors';

export const SafeArea = styled.View<{ paddingTop: number }>`
  ${({ theme, paddingTop }: { theme: DefaultTheme; paddingTop: number }) => css`
    background-color: ${theme.colors.backgroundDark};
    padding-top: ${paddingTop}px;
    flex-direction: column;
    flex: 1;
  `}
`;

export const ScreenContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    flex: 1;
    background-color: ${theme.colors.backgroundDark};
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding-horizontal: 24px;
  `}
`;

export const LinkContainer = styled.View`
  ${({ theme }: { theme: DefaultTheme }) => css`
    align-items: center;
    margin-top: ${theme.metrics.px(16)}px;
    margin-bottom: ${theme.metrics.px(32)}px;
  `}
`;

export const Title = styled(BaseText)`
  ${({ theme }: { theme: DefaultTheme }) => css`
    font-size: ${theme.metrics.px(27)}px;
    font-family: ${theme.fonts.title};
    color: ${theme.colors.primary500};
    margin-bottom: ${theme.metrics.hp(3)}px;
    line-height: 40.5px;
  `}
`;

export const PositionContainer = styled.View`
  ${({
    theme,
    mt,
    mb,
    ml,
    mr,
  }: {
    theme: DefaultTheme;
    mt?: number;
    mb?: number;
    ml?: number;
    mr?: number;
  }) => css`
    margin-top: ${theme.metrics.px(mt || 0)}px;
    margin-bottom: ${theme.metrics.px(mb || 0)}px;
    margin-left: ${theme.metrics.px(ml || 0)}px;
    margin-right: ${theme.metrics.px(mr || 0)}px;
  `}
`;

export const VenueSection = styled.View<{ paddingBottom: number }>`
  ${({ theme, paddingBottom }: { theme: DefaultTheme; paddingBottom: number }) => css`
    width: 100%;
    bottom: 0;
    background-color: ${theme.colors.primary};
    padding-horizontal: ${theme.metrics.px(24)}px;
    padding-bottom: ${paddingBottom}px;
    padding-top: ${theme.metrics.hp(2)}px;
    gap: ${theme.metrics.hp(1)}px;
  `}
`;

export const OrSection = styled.View`
  width: 100%;
  flex-grow: 1;
  justify-content: center;
`;

export const FormContainer = styled.View`
  width: 100%;
`;

export const EmailLinkContainer = styled.View`
  width: 100%;
  align-items: center;
  padding-vertical: 14px;
`;

export const GuestContainer = styled.View`
  align-items: center;
  padding-bottom: 24px;
  padding-top: 8px;
  margin-bottom: 24px;
`;

export const VersionText = styled.Text`
  ${({ theme }: { theme: DefaultTheme }) => css`
    margin-top: ${theme.metrics.px(12)}px;
    text-align: center;
    color: ${colors.grey400};
    font-size: 9px;
  `}
`;

export const modalBackgroundStyle = { backgroundColor: colors.grey400 };
