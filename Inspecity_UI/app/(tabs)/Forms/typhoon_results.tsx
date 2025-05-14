import React, { useEffect, useState } from 'react'; 
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import TyphoonWave from '../../../components/TyphoonWave';
import axios from 'axios';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// Simple font scale utility
const scaleFont = size => size * (width / 375);

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
  const answersArray = params.answers
    ? JSON.parse(Array.isArray(params.answers) ? params.answers[0] : params.answers)
    : [];

  const waveColor = getColorByPercentage();

  const [recommendation, setRecommendation] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_KEY = '***REMOVED***'; // Flask
  const GOOGLE_API_KEY = 'AlzaSykSYFuBf5L9fCC0YEoewTViPsGtHSGvJOL'; // Replace with your actual Google Maps API Key

    useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const response = await fetch(
          'https://flask-railway-sample-production.up.railway.app/fire-recommendation',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': API_KEY,
            },
            body: JSON.stringify({
              score: numericScore,
              answers: answersArray,
            }),
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unknown error from backend');

        setRecommendation(data.gemini_recommendation);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error fetching recommendation.');
      } finally {
        setLoading(false);
      }
    };

  const fetchNearbyFacilities = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission not granted');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const types = ['hospital', 'police', 'school', 'city_hall'];

      // Fetch results for each type
      const results = await Promise.all(types.map(type =>
        axios.get('https://maps.gomaps.pro/maps/api/place/nearbysearch/json', {
          params: {
            location: `${latitude},${longitude}`,
            radius: 5000,
            type,
            key: GOOGLE_API_KEY,
          },
        })
      ));

      // Limit 5 results per category and keep track of the results per type
      const allPlaces = results.flatMap(res => res.data.results);
      const groupedResults = {};

      types.forEach(type => {
        groupedResults[type] = allPlaces.filter(place =>
          place.types.includes(type)
        ).slice(0, 5); // Limit to 5 per type
      });

      // Flatten the results and prepare the mapped data
      const selected = [];
      for (const type of types) {
        const places = groupedResults[type];
        places.forEach(place => {
          selected.push({
            icon: mapPlaceTypeToIcon(place.types || []),
            color: '#4CAF50',
            label: place.name,
          });
        });
      }

      // Set the state with the selected facilities
      setFacilities(selected);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch nearby critical facilities.');
    }
  };

    fetchRecommendation();
    fetchNearbyFacilities();
  }, []);

  const mapPlaceTypeToIcon = (types: string[]): keyof typeof MaterialIcons.glyphMap => {
    if (types.includes('hospital')) return 'local-hospital';
    if (types.includes('police')) return 'local-police';
    if (types.includes('school')) return 'school';
    if (types.includes('city_hall') || types.includes('local_government_office')) return 'home-work';
    return 'location-on';
  };

  return (
    <SafeAreaView style={styles.container}>
      <TyphoonWave
        riskLevel={
          numericScore <= 5 ? 'low' :
          numericScore <= 10 ? 'medium' : 'high'
        }
        color={waveColor}
      />

      <ScrollView style={styles.wrapper} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.riskLevel, { color }]}>{label}</Text>
        <Text style={styles.title}>Typhoon Preparedness Result</Text>
        <Text style={styles.score}>You answered {numericScore} out of 15</Text>

        <View style={styles.recommendation}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <Text style={styles.recommendationText}>
            {loading ? 'Loading recommendations...' : recommendation}
          </Text>
        </View>
        <View style={styles.criticalFacilities}>
          <Text style={styles.sectionTitle}>Critical Facilities Near You</Text>
          {facilities.length === 0 && (
            <Text style={styles.recommendationText}>No facilities found or still loading...</Text>
          )}
          {facilities.map((facility, index) => (
            <View key={index} style={styles.facilityItem}>
              <MaterialIcons name={facility.icon} size={24} color={facility.color} />
              <Text style={styles.facilityText}>{facility.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    zIndex: 1,
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
