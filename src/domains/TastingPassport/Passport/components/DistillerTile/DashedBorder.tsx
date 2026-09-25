/**
 * A dashed rounded-rect border drawn with `react-native-svg`. React Native's native
 * `border-style: dashed` renders as a solid line whenever `border-radius` is non-zero (both iOS and
 * Android), so the "To Go" tile and chip can't get a real dashed outline from styles alone. This
 * overlays the parent, measures its laid-out size, and strokes a dashed rounded rect that lines up
 * with where the border would sit. `pointerEvents="none"` keeps the parent's press behaviour intact.
 */
import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

type Props = {
  /** Corner radius in px. Capped to half the measured height so pills stay pill-shaped. */
  radius: number;
  color: string;
  strokeWidth: number;
  /** Dash/gap lengths in px. */
  dashArray?: [number, number];
};

export const DashedBorder = ({ radius, color, strokeWidth, dashArray = [4, 3] }: Props) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const inset = strokeWidth / 2;
  const rx = Math.max(0, Math.min(radius, size.height / 2) - inset);

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none">
      {size.width > 0 && size.height > 0 && (
        <Svg width={size.width} height={size.height}>
          <Rect
            x={inset}
            y={inset}
            width={size.width - strokeWidth}
            height={size.height - strokeWidth}
            rx={rx}
            ry={rx}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
          />
        </Svg>
      )}
    </View>
  );
};
