import React, { useEffect } from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Blend toward white for a pastel look
const pastelizeHex = (hex: string, factor: number) => {
  const clamp = (val: number) => Math.max(0, Math.min(255, val));
  const mix = (channel: number) =>
    clamp(Math.round(channel + (255 - channel) * factor));

  const r = mix(parseInt(hex.slice(1, 3), 16));
  const g = mix(parseInt(hex.slice(3, 5), 16));
  const b = mix(parseInt(hex.slice(5, 7), 16));

  return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
};

interface WaveProps {
  percentage?: number;
  color?: string; // treated as darkest pastel
  cycles?: number;
  layers?: number;
}

const Wave: React.FC<WaveProps> = ({
  percentage = 0.5,
  color = '#F5C45E', // pastel yellow base
  cycles = 2,
  layers = 7,
}) => {
  const clamped = Math.max(0, Math.min(percentage, 1));
  const minOffset = 50;
  const yLevel = height * (1 - clamped) + (clamped === 0 ? minOffset : 0);

  const phases = Array.from({ length: layers }, () => useSharedValue(0));

  useEffect(() => {
    phases.forEach((phase, i) => {
      phase.value = withRepeat(
        withTiming(2 * Math.PI, {
          duration: 8000 - i * 500,
          easing: Easing.linear,
        }),
        -1
      );
    });
  }, []);

  const createAnimatedProps = (
    phase: Animated.SharedValue<number>,
    amplitude: number,
    offset: number
  ) =>
    useAnimatedProps(() => {
      const step = 2;
      const twoPi = 2 * Math.PI;
      let d = `M0 ${yLevel + offset}`;

      for (let x = 0; x <= width; x += step) {
        const angle = (x / width) * cycles * twoPi + phase.value;
        const y = yLevel + offset + amplitude * Math.sin(angle);
        d += ` L${x} ${y}`;
      }

      d += ` L${width} ${height} L0 ${height} Z`;
      return { d };
    });

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        {[...Array(layers)].map((_, i) => {
          const indexFromBottom = layers - 1 - i;
          const offset = i * 30;
          const amplitude = 20 - i * 1.5;
          const pastelFactor = indexFromBottom * 0.1; // closer to white as it rises
          const fill = pastelizeHex(color, pastelFactor);
          const animatedProps = createAnimatedProps(phases[i], amplitude, offset);
          return (
            <AnimatedPath
              key={i}
              animatedProps={animatedProps}
              fill={fill}
            />
          );
        })}
      </Svg>
    </View>
  );
};

export default Wave;
