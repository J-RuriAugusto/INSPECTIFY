import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Results = () => {
  const params = useLocalSearchParams();
  const scoreParam = Array.isArray(params.score) ? params.score[0] : params.score;
  const numericScore = parseInt(scoreParam || '0', 10);

  const getRiskLevel = () => {
    if (numericScore <= 5) return { label: 'Low Risk', color: '#4CAF50' };
    if (numericScore <= 10) return { label: 'Moderate Risk', color: '#FFC107' };
    return { label: 'High Risk', color: '#F44336' };
  };

  const { label, color } = getRiskLevel();

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.scrollContent}>
      {/* Result Card */}
      <View style={styles.container}>
        <Text style={styles.title}>Flood Preparedness Result</Text>
        <Text style={styles.score}>You answered {numericScore} out of 15</Text>

        <View style={styles.barContainer}>
          <View 
            style={[styles.bar, { width: `${(numericScore / 15) * 100}%`, backgroundColor: color }]}
          />
        </View>

        <Text style={[styles.riskLevel, { color }]}>{label}</Text>
      </View>

      <View style={styles.recommendation}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <Text style={styles.recommendationText}>
          Your preparedness level is currently low. It’s important to take immediate steps to increase your awareness and readiness. Start by learning your community’s flood warning systems, identifying nearby evacuation centers, and preparing a basic emergency go-bag with essentials like water, flashlight, medicine, and documents.
        </Text>
      </View>

      {/* Critical Facilities Section */}
      <View style={styles.criticalFacilities}>
        <Text style={styles.sectionTitle}>Critical Facilities Near You</Text>
        
        <View style={styles.facilityItem}>
          <MaterialIcons name="local-hospital" size={24} color="#F44336" />
          <Text style={styles.facilityText}>Cebu City Medical Center</Text>
        </View>

        <View style={styles.facilityItem}>
          <MaterialIcons name="local-police" size={24} color="#2196F3" />
          <Text style={styles.facilityText}>Police Station 1 - Stationed Near Fuente Osmeña</Text>
        </View>

        <View style={styles.facilityItem}>
          <MaterialIcons name="home-work" size={24} color="#4CAF50" />
          <Text style={styles.facilityText}>Barangay Hall - Capitol Site</Text>
        </View>

        <View style={styles.facilityItem}>
          <MaterialIcons name="local-hospital" size={24} color="#F44336" />
          <Text style={styles.facilityText}>North General Hospital</Text>
        </View>

        <View style={styles.facilityItem}>
          <MaterialIcons name="home-work" size={24} color="#4CAF50" />
          <Text style={styles.facilityText}>Talamban National High School</Text>
        </View>

        <View style={styles.facilityItem}>
          <MaterialIcons name="emoji-people" size={24} color="#FFC107" />
          <Text style={styles.facilityText}>Evacuation Center - Cebu Sports Complex</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingVertical: 10,
  },
  scrollContent: {
    paddingBottom: 20, // Ensures space at the bottom of the content
  },
  container: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#030F1C',
    marginBottom: 10,
    textAlign: 'center',
  },
  score: {
    fontSize: 16,
    marginBottom: 10,
  },
  barContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  bar: {
    height: '100%',
    borderRadius: 6,
  },
  riskLevel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
  },
  recommendation: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 20,
    elevation: 2,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'justify',
    color: '#333',
  },
  criticalFacilities: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
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
    fontSize: 14,
    marginLeft: 10,
    color: '#333',
  },
});

export default Results;
