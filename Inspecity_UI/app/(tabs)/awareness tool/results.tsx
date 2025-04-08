import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const Results = () => {
  const params = useLocalSearchParams();
  const scoreParam = Array.isArray(params.score) ? params.score[0] : params.score;
  const numericScore = parseInt(scoreParam || '0', 10); // Fallback to 0 if undefined

  const getRiskLevel = () => {
    if (numericScore <= 5) return { label: 'Low Risk', color: '#4CAF50' };
    if (numericScore <= 10) return { label: 'Moderate Risk', color: '#FFC107' };
    return { label: 'High Risk', color: '#F44336' };
  };

  const { label, color } = getRiskLevel();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flood Preparedness Result</Text>
      <Text style={styles.score}>You answered {numericScore} out of 15</Text>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            { width: `${(numericScore / 15) * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.riskLevel, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F2F2F2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#030F1C',
  },
  score: {
    fontSize: 18,
    marginBottom: 10,
  },
  barContainer: {
    width: '100%',
    height: '3%',
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  riskLevel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Results;
