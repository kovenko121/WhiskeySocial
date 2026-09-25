/**
 * The tasting-glass overlay on a Visited tile. Ported 1:1 from the prototype's inline SVG:
 * 58×58, rotated −12°, overlapping the tile's right edge, with the bowl filled proportionally to
 * tasted-pour count (capped at 3) and clipped to the bowl shape. `react-native-svg` is already a
 * dependency.
 */
import { theme } from '@theme';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Path,
  Rect,
} from 'react-native-svg';

type Props = {
  /** Fill level 0–3, from `glassFillLevel(tastedCount)`. */
  level: 0 | 1 | 2 | 3;
  /** Rendered edge in px. Defaults to the grid tile's 58; the onboarding preview passes a smaller value. */
  size?: number;
};

// (y, height) of the fill rect per level — the prototype's mapping.
const FILL: Record<number, { y: number; height: number }> = {
  0: { y: 60, height: 0 },
  1: { y: 51, height: 9 },
  2: { y: 44, height: 16 },
  3: { y: 35, height: 25 },
};

const STROKE = 'rgba(0,0,0,0.3)';

export const GlassOverlay = ({ level, size = 58 }: Props) => {
  const fill = FILL[level];
  return (
    <Svg width={size} height={size} viewBox="23 22 54 54">
      <Defs>
        <ClipPath id="ws-glass-bowl-clip">
          <Path d="M43,33 C43,42 40,45 38,49 C36.5,53.5 40.5,57 47,59 L53,59 C59.5,57 63.5,53.5 62,49 C60,45 57,42 57,33 Z" />
        </ClipPath>
      </Defs>
      <Circle cx={50} cy={49} r={27} fill="none" stroke={STROKE} strokeWidth={0.75} />
      <Circle
        cx={50}
        cy={49}
        r={22.5}
        fill="rgba(255,255,255,0.1)"
        stroke={STROKE}
        strokeWidth={0.75}
      />
      {fill.height > 0 && (
        <Rect
          x={35}
          y={fill.y}
          width={30}
          height={fill.height}
          fill={theme.colors.warning}
          fillOpacity={0.7}
          clipPath="url(#ws-glass-bowl-clip)"
        />
      )}
      <Path
        d="M42,32 C42,42 39,45 37,49 C35,54 39,58 46,60 L46,63 C46,64.5 43,65.5 41,66 L59,66 C57,65.5 54,64.5 54,63 L54,60 C61,58 65,54 63,49 C61,45 58,42 58,32"
        fill="none"
        stroke={STROKE}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Path d="M42,32 L58,32" stroke={STROKE} strokeWidth={1} strokeLinecap="round" />
    </Svg>
  );
};
