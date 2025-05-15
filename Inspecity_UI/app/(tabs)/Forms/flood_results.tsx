import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Video } from 'expo-av';

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

  // const facilities = [
  //   { icon: 'local-hospital', color: '#F44336', label: 'Cebu City Medical Center' },
  //   { icon: 'local-police', color: '#2196F3', label: 'Police Station 1 - Near Fuente Osmeña' },
  //   { icon: 'home-work', color: '#4CAF50', label: 'Barangay Hall - Capitol Site' },
  //   { icon: 'local-hospital', color: '#F44336', label: 'North General Hospital' },
  //   { icon: 'home-work', color: '#4CAF50', label: 'Talamban National High School' },
  //   { icon: 'emoji-people', color: '#FFC107', label: 'Evacuation Center - Cebu Sports Complex' },
  // ];

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
          'https://flask-railway-sample-production.up.railway.app/flood-recommendation',
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
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        source={require('../../../assets/videos/houses.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isMuted
        isLooping
      />

      {/* Top Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Flood Preparedness Result</Text>
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
        modalHeight={height - 350}
        panGestureEnabled
        onPositionChange={handlePositionChange}
        scrollViewProps={{
          scrollEnabled: isModalOpen,
          showsVerticalScrollIndicator: false,
        }}
      >
        {/* Collapsed visible header */}
        <View style={styles.collapsedHeader}>
          <Text style={styles.collapsedLabel}>Recommendations & Critical Facilities</Text>
        </View>

        {/* Expanded modal content */}
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Recommendations</Text>
          <Text style={styles.modalText}>
            Start by learning your community’s flood warning systems, identifying nearby evacuation
            centers, and preparing a go-bag with water, flashlight, medicine, and documents.
          </Text>

          <Text style={styles.modalTitle}>Critical Facilities Near You</Text>

          <View style={styles.facilityItem}>
            <MaterialIcons name="local-hospital" size={20} color="#F44336" />
            <Text style={styles.facilityText}>Cebu City Medical Center</Text>
          </View>

          <View style={styles.facilityItem}>
            <MaterialIcons name="local-police" size={20} color="#2196F3" />
            <Text style={styles.facilityText}>Police Station - Fuente Osmeña</Text>
          </View>

          <View style={styles.facilityItem}>
            <MaterialIcons name="home-work" size={20} color="#4CAF50" />
            <Text style={styles.facilityText}>Barangay Hall - Capitol Site</Text>
          </View>

          <View style={styles.facilityItem}>
            <MaterialIcons name="emoji-people" size={20} color="#FFC107" />
            <Text style={styles.facilityText}>Evacuation Center - Cebu Sports Complex</Text>
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
    backgroundColor: '#fff',
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
    marginTop: 10,
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
    flexShrink: 1,
  },
});

export default Results;
