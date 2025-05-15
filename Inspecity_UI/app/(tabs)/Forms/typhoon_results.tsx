import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import axios from 'axios';

const { height } = Dimensions.get('window');

const Results = () => {
  const modalRef = useRef<Modalize>(null);
  const params = useLocalSearchParams();
  const scoreParam = Array.isArray(params.score) ? params.score[0] : params.score;
  const numericScore = parseInt(scoreParam || '0', 10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePositionChange = (position: 'initial' | 'top') => {
    setIsModalOpen(position === 'top');
  };

  const getRiskLevel = () => {
    if (numericScore <= 5) return { label: 'Low Risk', color: '#4CAF50' };
    if (numericScore <= 10) return { label: 'Moderate Risk', color: '#FFC107' };
    return { label: 'High Risk', color: '#F44336' };
  };

  const { label, color } = getRiskLevel();
  const answersArray = params.answers
  ? JSON.parse(Array.isArray(params.answers) ? params.answers[0] : params.answers)
  : [];

  const [recommendation, setRecommendation] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_KEY = 'BT_1smAfCA4roEldR7S9LObSgdbZ7uGAF2HJvs5VQyY'; // Flask
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

  const mapPlaceTypeToIcon = (types) => {
    if (types.includes('hospital')) return 'local-hospital';
    if (types.includes('police')) return 'local-police';
    if (types.includes('school')) return 'school';
    if (types.includes('city_hall') || types.includes('local_government_office')) return 'home-work';
    return 'location-on';
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        source={require('../../../assets/videos/houses3.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isMuted
        isLooping
      />

      {/* Top Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Typhoon Preparedness Result</Text>
        
        <Text style={[styles.riskLevel, { color }]}>{label}</Text>
        <View style={styles.barContainer}>
          <View
            style={[styles.bar, { width: `${(numericScore / 15) * 100}%`, backgroundColor: color }]}
          />
        </View>
        <Text style={styles.score}>You answered {numericScore} out of 15</Text>
        <Text style={styles.swipeUpLabel}>⬆ Swipe up for recommendations</Text>
      </View>

      {/* Always-Open Modal */}
      <Modalize
        ref={modalRef}
        alwaysOpen={70}
        modalStyle={styles.modal}
        handleStyle={styles.handle}
        panGestureEnabled
        modalHeight={height - 350}
        onPositionChange={handlePositionChange}
        scrollViewProps={{
          scrollEnabled: isModalOpen,
          showsVerticalScrollIndicator: false,
        }}
      >

        {/* This section is always visible when modal is collapsed */}
        <View style={styles.collapsedHeader}>
          <Text style={styles.collapsedLabel}>Recommendations & Critical Facilities</Text>
        </View>

        {/* Full content shown when expanded */}
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Recommendations</Text>
          <Text style={styles.modalText}>
            {loading ? 'Loading recommendations...' : recommendation}
          </Text>

          <Text style={styles.modalTitle}>Critical Facilities Near You</Text>

          <View style={styles.criticalFacilities}>
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
        </View>
      </Modalize>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    marginTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#19477B',
    marginTop: -10,
    textAlign: 'center',
  },
  score: {
    fontSize: 16,
    color: '#fffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  barContainer: {
    width: '90%',
    height: 10,
    backgroundColor: '#ffff',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
    alignSelf: 'center',
  },
  bar: {
    height: '100%',
    borderRadius: 6,
  },
  riskLevel: {
    fontSize: 35,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    marginTop:10,
  },
  swipeUpLabel: {
    color: '#848484',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12,
  },
  modal: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    backgroundColor: '#ccc',
    width: 60,
  },
  modalContent: {
    paddingBottom: 100,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'justify',
    color: '#333',
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  facilityText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },

  collapsedHeader: {
  paddingTop: 10,
  paddingBottom: 10,
  marginBottom: 10,
  alignItems: 'center',
  borderBottomWidth: 2,
  borderBottomColor: '#eee',
},
collapsedLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#444',
},
criticalFacilities: {
  marginTop: 10,
},
recommendationText: {
  fontSize: 14,
  color: '#666',
  textAlign: 'center',
  marginTop: 10,
},
});

export default Results;