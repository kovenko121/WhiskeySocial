/**
 * A single equal-width state toggle (To Go / Visited / Favorite, and the per-pour Tasted/Favorite).
 * On = tinted background + colored border and content; off = grey fill, transparent border, muted
 * content. Icon over label.
 */
import { Icon } from '@components';
import { getTestId } from '@helpers';
import { Icons } from '@types';
import { DefaultTheme } from 'styled-components/native';
import { ToggleLabel, ToggleWrap } from './styles';

type Props = {
  icon: Icons;
  label: string;
  active: boolean;
  activeColor: keyof DefaultTheme['colors'];
  onPress: () => void;
  testID: string;
  /** Set once the event's open window has run out — the toggle stays legible but inert. */
  disabled?: boolean;
};

export const ToggleButton = ({
  icon,
  label,
  active,
  activeColor,
  onPress,
  testID,
  disabled = false,
}: Props) => (
  <ToggleWrap
    active={active}
    activeColor={activeColor}
    onPress={onPress}
    disabled={disabled}
    testID={getTestId(testID)}
  >
    <Icon name={icon} size={18} color={active ? activeColor : 'grey100'} />
    <ToggleLabel active={active} activeColor={activeColor}>
      {label}
    </ToggleLabel>
  </ToggleWrap>
);
