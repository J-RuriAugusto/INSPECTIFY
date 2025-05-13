import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import TriangleGrid from '../../../components/TriangleGrid';

const { width, height } = Dimensions.get('window');

const Results = () => {
  const params = useLocalSearchParams();
  const scoreParam = Array.isArray(params.score) ? params.score[0] : params.score;
  const numericScore = parseInt(scoreParam || '0', 10);

  const getRiskLevel = () => {
    if (numericScore <= 5) return { label: 'Low Risk', color: '#2E8532' };
    if (numericScore <= 10) return { label: 'Moderate Risk', color: '#DD940E' };
    return { label: 'High Risk', color: '#A9241A' };
  };

  const { label, color } = getRiskLevel();

  const getColorByPercentage = () => {
    if (numericScore <= 5) return '#4CAF50';
    if (numericScore <= 10) return '#FFC107';
    return '#F44336';
  };

  const waveColor = getColorByPercentage();

  const facilities = [
    { icon: 'local-hospital', color: '#F44336', label: 'Cebu City Medical Center' },
    { icon: 'local-police', color: '#2196F3', label: 'Police Station 1 - Near Fuente Osmeña' },
    { icon: 'home-work', color: '#4CAF50', label: 'Barangay Hall - Capitol Site' },
    { icon: 'local-hospital', color: '#F44336', label: 'North General Hospital' },
    { icon: 'home-work', color: '#4CAF50', label: 'Talamban National High School' },
    { icon: 'emoji-people', color: '#FFC107', label: 'Evacuation Center - Cebu Sports Complex' },
  ];

  return (
    <View style={styles.container}>
      <TriangleGrid percentage={numericScore / 15} color={waveColor} />

      <ScrollView style={styles.wrapper} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.riskLevel, { color }]}>{label}</Text>
        <Text style={styles.title}>Preparedness Score</Text>
        <Text style={styles.score}>You answered {numericScore} out of 15</Text>

        <View style={styles.recommendation}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <Text style={styles.recommendationText}>
            Disasters can strike without warning—whether earthquakes, typhoons, fires, or other emergencies. Regardless of your current preparedness level, now is the best time to take action. Prepare a go-bag with essentials like food, water, medicine, flashlight, and documents. Know your local emergency numbers, stay informed through official channels, and make sure your family has a communication and evacuation plan.
          </Text>
        </View>

        <View style={styles.criticalFacilities}>
          <Text style={styles.sectionTitle}>Critical Facilities Near You</Text>
          {facilities.map((facility, index) => (
            <View key={index} style={styles.facilityItem}>
              <MaterialIcons name={facility.icon} size={24} color={facility.color} />
              <Text style={styles.facilityText}>{facility.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.05,
  },
  scrollContent: {
    paddingBottom: height * 0.1,
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#030F1C',
    marginBottom: 10,
    textAlign: 'center',
  },
  score: {
    fontSize: width * 0.04,
    marginBottom: 20,
    textAlign: 'center',
    marginTop: -5,
  },
  riskLevel: {
    fontSize: width * 0.1,
    fontWeight: '900',
    marginBottom: 3,
    textAlign: 'center',
  },
  recommendation: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: 16,
    elevation: 2,
  },
  recommendationText: {
    fontSize: width * 0.035,
    lineHeight: 20,
    textAlign: 'justify',
    color: '#333',
  },
  criticalFacilities: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    padding: width * 0.04,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#030F1C',
    marginBottom: 10,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityText: {
    fontSize: width * 0.037,
    marginLeft: 10,
    color: '#333',
    flexShrink: 1,
  },
});

export default Results;
