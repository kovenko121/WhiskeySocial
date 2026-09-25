import { createIconSetFromIcoMoon , MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@theme';
import { Icons as IconsNames } from '@types';
import { DefaultTheme } from 'styled-components/native';
import selection from '../../../assets/fonts/selection.json';
import { BadgeText, BadgeWrapper, IconWrapper } from './styles';

type IconProps = {
  name?: IconsNames;
  materialIcon?: keyof typeof MaterialCommunityIcons['glyphMap'];
  size?: number;
  color?: keyof DefaultTheme['colors'];
  badgeText?: string;
};

const BaseIcon = createIconSetFromIcoMoon(selection, 'ws', 'ws.ttf');

export const Icon = ({
  name,
  materialIcon,
  size = 48,
  color = 'black',
  badgeText,
}: IconProps) => (
  <IconWrapper>
    {materialIcon ? (
      <MaterialCommunityIcons
        name={materialIcon}
        size={size}
        color={theme.colors[color]}
      />
    ) : (
      <BaseIcon name={name} size={size} color={theme.colors[color]} />
    )}
    {badgeText != null && badgeText !== '0' && (
      <BadgeWrapper>
        <BadgeText>{badgeText}</BadgeText>
      </BadgeWrapper>
    )}
  </IconWrapper>
);
