import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

type RiskLevel = 'low' | 'medium' | 'high';

interface RiskSettings {
  rings: number;
  scale: number;
  duration: number;
}

interface ConcentricWavesProps {
  riskLevel?: RiskLevel;
  color?: string;
}

const { width, height } = Dimensions.get('window');

const riskSettings: Record<RiskLevel, RiskSettings> = {
  low: {
    rings: 10,
    scale: 3,
    duration: 6000,
  },
  medium: {
    rings: 15,
    scale: 5,
    duration: 5000,
  },
  high: {
    rings: 20,
    scale: 8,
    duration: 4000,
  },
};

const ConcentricWaves = ({ riskLevel = 'medium', color = '#7C4DFF' }: ConcentricWavesProps) => {
  const { rings: NUM_RINGS, scale: MAX_SCALE, duration: DURATION } =
    riskSettings[riskLevel] || riskSettings.medium;

  const BASE_SIZE = 200;
  const rings = Array.from({ length: NUM_RINGS }, () => new Animated.Value(0));

  useEffect(() => {
    rings.forEach((anim, i) => {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: DURATION,
          delay: i * (DURATION / NUM_RINGS),
          useNativeDriver: true,
        })
      ).start();
    });
  }, [riskLevel]);

  return (
    <View style={styles.container}>
      {rings.map((anim, index) => {
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.2, MAX_SCALE],
        });

        const opacity = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 0],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.ring,
              {
                borderColor: color,
                width: BASE_SIZE,
                height: BASE_SIZE,
                borderRadius: BASE_SIZE / 2,
                transform: [{ scale }],
                opacity: opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  ring: {
    position: 'absolute',
    borderWidth: 25,
  },
});

export default ConcentricWaves;
