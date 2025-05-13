import React, { useEffect } from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const BAR_COUNT = 40; // number of horizontal bars (rows)
const COLUMN_COUNT = 3; // number of vertical columns (more waves)
const BAR_HEIGHT = height / BAR_COUNT;
const COLUMN_SPACING = width / (COLUMN_COUNT + 1); // even spacing

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type RiskLevel = 'low' | 'medium' | 'high';

interface EarthquakeWaveProps {
  color?: string;
  riskLevel?: RiskLevel;
}

const RISK_CONFIG: Record<RiskLevel, { barWidth: number; speed: number }> = {
  low: { barWidth: width * 0.4, speed: 3000 },
  medium: { barWidth: width * 0.7, speed: 2000 },
  high: { barWidth: width * 1.3, speed: 1000 },
};

const EarthquakeWave: React.FC<EarthquakeWaveProps> = ({
  color = '#FFFFFF',
  riskLevel = 'low',
}) => {
  const { barWidth, speed } = RISK_CONFIG[riskLevel];

  // Create 2D array: columns × rows
  const columns = Array.from({ length: COLUMN_COUNT }, () =>
    Array.from({ length: BAR_COUNT }, () => useSharedValue(50))
  );

  useEffect(() => {
    columns.forEach((column) =>
      column.forEach((w) => {
        w.value = withRepeat(
          withTiming(Math.random() * barWidth, {
            duration: speed,
          }),
          -1,
          true
        );
      })
    );
  }, [barWidth, speed]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        {columns.map((column, colIndex) => {
          const centerX = colIndex * COLUMN_SPACING + COLUMN_SPACING;

          return column.map((w, rowIndex) => {
            const animatedProps = useAnimatedProps(() => ({
              x: centerX - w.value / 2, // center horizontally
              width: w.value,
            }));

            const distanceFromCenter = Math.abs(rowIndex - BAR_COUNT / 2);
            const barOpacity = 1 - distanceFromCenter / (BAR_COUNT / 2); // fade top/bottom

            return (
              <AnimatedRect
                key={`${colIndex}-${rowIndex}`}
                y={rowIndex * BAR_HEIGHT}
                height={BAR_HEIGHT * 1.5}
                animatedProps={animatedProps}
                fill={color}
                opacity={barOpacity}
                rx={2}
              />
            );
          });
        })}
      </Svg>
    </View>
  );
};

export default EarthquakeWave;
