import { TextProps } from 'react-native';
import styled, { css, DefaultTheme } from 'styled-components/native';

type ExtendedTextProps = {
  size?: number;
  color?: keyof DefaultTheme['colors'];
  mv?: number;
  mh?: number;
  bold?: boolean;
  underlined?: boolean;
  align?: string;
  lh?: number;
  mt?: number;
  mb?: number;
  mr?: number;
  active?: boolean;
  center?: boolean;
  lineHeight?: number | undefined;
} & TextProps;

export const BaseText = styled.Text.attrs({
  allowFontScaling: false,
})<ExtendedTextProps>`
  ${({ theme, mv, mh, align = 'center' }) => css`
    margin-vertical: ${theme.metrics.px(mv || 0)}px;
    margin-horizontal: ${theme.metrics.px(mh || 0)}px;
    text-align: ${align};
  `}
`;

export const Title = styled(BaseText)<ExtendedTextProps>`
  ${({
    theme,
    size = 22,
    color = 'white',
    align = 'center',
    mt = 10,
    mb = 0,
  }) => css`
    font-size: ${theme.metrics.px(size)}px;
    color: ${theme.colors[color]};
    font-family: ${theme.fonts.title};
    text-align: ${align};
    margin-top: ${theme.metrics.px(mt)}px;
    margin-bottom: ${theme.metrics.px(mb)}px;
    line-height: ${theme.metrics.px(size * 1.2)}px;
  `}
`;

export const SubTitle = styled(BaseText)<ExtendedTextProps>`
  ${({ theme, color = 'white', size = 18, mv, mt, center }) => css`
    font-family: ${theme.fonts.title};
    line-height: ${theme.metrics.px(size + size * (50 / 100))}px;
    text-align: ${center ? 'center' : 'left'};
    color: ${theme.colors[color]};
    font-size: ${theme.metrics.px(size)}px;
    margin-vertical: ${theme.metrics.px(mv || 0)}px;
    margin-top: ${theme.metrics.px(mt || mv || 0)}px;
  `}
`;

export const SectionSubTitle = styled(BaseText)<ExtendedTextProps>`
  ${({ theme, color = 'white', size = 18, mv, mt, center, bold }) => css`
    font-family: ${bold ? theme.fonts.bold : theme.fonts.regular};
    line-height: ${theme.metrics.px(40.5)}px;
    text-align: ${center ? 'center' : 'left'};
    color: ${theme.colors[color]};
    font-size: ${theme.metrics.px(size)}px;
    margin-vertical: ${theme.metrics.px(mv || 0)}px;
    margin-top: ${theme.metrics.px(mt || mv || 0)}px;
  `}
`;

export const Secondary = styled(BaseText)<ExtendedTextProps>`
  ${({ theme, color = 'grey25', center = false }) => css`
    font-family: ${theme.fonts.regular};
    font-size: ${theme.metrics.px(11)}px;
    line-height: ${theme.metrics.px(16.5)}px;
    text-align: ${center ? 'center' : 'left'};
    color: ${theme.colors[color]};
  `}
`;

export const SectionTitle = styled(BaseText)<ExtendedTextProps>`
  ${({ theme, color = 'grey25', bold = false, size = 18, lineHeight, mb = 0 }) => css`
    font-family: ${bold ? theme.fonts.bold : theme.fonts.regular};
    font-size: ${theme.metrics.px(size)}px;
    line-height: ${lineHeight || theme.metrics.px(25)}px;
    text-align: left;
    color: ${theme.colors[color]};
    margin-bottom: ${theme.metrics.px(mb)}px;
  `}
`;

export const CardTitle = styled(BaseText)<ExtendedTextProps>`
  ${({ theme, color = 'grey25' }) => css`
    font-family: ${theme.fonts.title};
    font-size: ${theme.metrics.px(18)}px;
    line-height: ${theme.metrics.px(24.3)}px;
    text-align: left;
    color: ${theme.colors[color]};
  `}
`;

export const Text = styled(BaseText)<ExtendedTextProps>`
  ${({ theme, size = 11, color = 'white', bold = false, align = 'left', mr, mv }) => css`
    font-size: ${theme.metrics.px(size)}px;
    text-align: ${align};
    color: ${theme.colors[color]};
    margin-vertical: ${theme.metrics.px(mv || 0)}px;
    margin-right: ${theme.metrics.px(mr || 0)}px;
    font-family: ${bold ? theme.fonts.bold : theme.fonts.regular};
  `}
`;

export const Link = styled(BaseText)<ExtendedTextProps>`
  ${({
    theme,
    size = 12,
    color = 'black',
    bold = false,
    underlined = false,
    align = 'center',
    mh = 0,
  }) => css`
    font-size: ${theme.metrics.px(size || 12)}px;
    color: ${theme.colors[color]};
    font-family: ${bold ? theme.fonts.semibold : theme.fonts.regular};
    text-decoration-line: ${underlined ? 'underline' : 'none'};
    text-align: ${align};
    margin-horizontal: ${theme.metrics.px(mh || 0)}px;
  `}
`;
