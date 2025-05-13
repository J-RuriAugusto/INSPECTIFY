import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

interface TriangleGridProps {
  percentage?: number; // 0 to 1
  color?: string;
}

const TriangleGrid: React.FC<TriangleGridProps> = ({ percentage = 0, color = '#607D8B' }) => {
  const clamped = Math.max(0, Math.min(percentage, 1));
  const size = 40;
  const cols = Math.ceil(width / size) + 1;
  const rows = Math.ceil(height / size) + 1;

  // master animation progress (looping)
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 4000 - clamped * 3000, // faster animation at higher percentage
      }),
      -1,
      false
    );
  }, [clamped]);

  const renderTriangle = (x: number, y: number, direction: 'up' | 'down', index: number) => {
    const phaseOffset = (x + y) * 0.01; // creates wave offset based on position

    const animatedOpacity = useDerivedValue(() => {
      return interpolate(
        Math.sin(progress.value + phaseOffset),
        [-1, 1],
        [0.2, 0.6 + clamped * 0.3]
      );
    });

    const animatedProps = useAnimatedProps(() => ({
      opacity: animatedOpacity.value,
    }));

    let points;
    if (direction === 'up') {
      points = `${x},${y} ${x + size},${y} ${x + size / 2},${y + size}`;
    } else {
      points = `${x},${y} ${x + size / 2},${y + size} ${x - size / 2},${y + size}`;
    }

    return (
      <AnimatedPolygon
        key={`${direction}-${index}`}
        points={points}
        fill={color}
        animatedProps={animatedProps}
      />
    );
  };

  const triangles = [];
  let index = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * size;
      const y = row * size;

      triangles.push(renderTriangle(x, y, 'up', index++));
      triangles.push(renderTriangle(x, y, 'down', index++));
    }
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        {triangles}
      </Svg>
    </View>
  );
};

export default TriangleGrid;
