import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { WebView } from 'react-native-webview';

const { height } = Dimensions.get('window');

type MaterialIconName = 'local-hospital' | 'local-police' | 'school' | 'home-work' | 'location-on' | 'download';

interface Facility {
  icon: MaterialIconName;
  color: string;
  label: string;
  distance?: number;
}

interface GroupedResults {
  [key: string]: Array<{
    types: string[];
    name: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
}

const Results = () => {
  const modalRef = useRef<Modalize>(null);
  const params = useLocalSearchParams();
  const scoreParam = Array.isArray(params.score) ? params.score[0] : params.score;
  const numericScore = parseInt(scoreParam || '0', 10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handlePositionChange = (position: 'initial' | 'top') => {
    setIsModalOpen(position === 'top');
  };

  const getRiskLevel = () => {
    if (numericScore <= 5) return { label: 'Low Risk', color: '#2E8532' };
    if (numericScore <= 10) return { label: 'Moderate Risk', color: '#DD940E' };
    return { label: 'High Risk', color: '#A9241A' };
  };

  const { label, color } = getRiskLevel();

  const answersArray = params.answers
    ? JSON.parse(Array.isArray(params.answers) ? params.answers[0] : params.answers)
    : [];

  const [recommendation, setRecommendation] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = 'BT_1smAfCA4roEldR7S9LObSgdbZ7uGAF2HJvs5VQyY'; // Flask
  const GOOGLE_API_KEY = 'AlzaSykSYFuBf5L9fCC0YEoewTViPsGtHSGvJOL';

  // const facilities = [
  //   { icon: 'local-hospital', color: '#F44336', label: 'Cebu City Medical Center' },
  //   { icon: 'local-police', color: '#2196F3', label: 'Police Station 1 - Near Fuente Osmeña' },
  //   { icon: 'home-work', color: '#4CAF50', label: 'Barangay Hall - Capitol Site' },
  //   { icon: 'local-hospital', color: '#F44336', label: 'North General Hospital' },
  //   { icon: 'home-work', color: '#4CAF50', label: 'Talamban National High School' },
  //   { icon: 'emoji-people', color: '#FFC107', label: 'Evacuation Center - Cebu Sports Complex' },
  // ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchRecommendation(),
          fetchNearbyFacilities()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, []);

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
      const groupedResults: GroupedResults = {};

      types.forEach(type => {
        groupedResults[type] = allPlaces.filter(place =>
          place.types.includes(type)
        ).slice(0, 5); // Limit to 5 per type
      });

      // Flatten the results and prepare the mapped data
      const selected: Facility[] = [];
      for (const type of types) {
        const places = groupedResults[type];
        places.forEach(place => {
          const distance = calculateDistance(
            latitude,
            longitude,
            place.geometry.location.lat,
            place.geometry.location.lng
          );
          selected.push({
            icon: mapPlaceTypeToIcon(place.types || []),
            color: '#4CAF50',
            label: place.name,
            distance: distance
          });
        });
      }
      // Sort facilities by distance
      selected.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setFacilities(selected);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch nearby critical facilities.');
    }
  };

  const mapPlaceTypeToIcon = (types: string[]): MaterialIconName => {
    if (types.includes('hospital')) return 'local-hospital';
    if (types.includes('police')) return 'local-police';
    if (types.includes('school')) return 'school';
    if (types.includes('city_hall') || types.includes('local_government_office')) return 'home-work';
    return 'location-on';
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m away`;
    }
    return `${distance.toFixed(1)} km away`;
  };

  const generatePreviewHtml = () => {
    const logoBase64 = `data:image/png;base64,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`;

    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Flood Preparedness Assessment</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              padding: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              display: flex;
              align-items: center;
              border-bottom: 2px solid #4CAF50;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header img {
              height: 60px;
              margin-right: 15px;
            }
            .header-text h1 {
              font-size: 1.4rem;
              color: #2E86C1;
              margin: 0 0 5px 0;
              font-weight: 600;
            }
            .header-text p {
              font-size: 0.875rem;
              color: #666;
              margin: 0;
            }
            .meta {
              margin-bottom: 20px;
              font-size: 0.875rem;
              color: #555;
              background: #f8f9fa;
              padding: 15px;
              border-radius: 4px;
            }
            h1 { 
              color: #2E86C1; 
              margin-bottom: 10px;
            }
            h2 {
              font-size: 1.2rem;
              color: #2E86C1;
              margin-top: 20px;
              margin-bottom: 10px;
              font-weight: 600;
            }
            .label { 
              font-weight: bold; 
              margin-top: 10px; 
            }
            ul { 
              padding-left: 20px; 
            }
            li { 
              margin-bottom: 5px;
            }
            .risk-level {
              font-size: 1.5rem;
              font-weight: bold;
              color: ${color};
              text-align: center;
              margin: 15px 0;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            .score {
              text-align: center;
              font-size: 1.2rem;
              margin: 10px 0;
              color: #555;
            }
            .section {
              margin: 20px 0;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            .section-title {
              font-size: 1.1rem;
              font-weight: bold;
              color: #2E86C1;
              margin-bottom: 10px;
            }
            .facility-item {
              margin: 8px 0;
              padding: 8px;
              background: white;
              border-radius: 4px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .facility-distance {
              font-size: 0.875rem;
              color: #666;
              font-style: italic;
              margin-top: 2px;
            }
            .footer {
              font-size: 0.75rem;
              text-align: center;
              color: #777;
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoBase64}" alt="Inspectify Logo" />
            <div class="header-text">
              <h1>Flood Preparedness Assessment</h1>
              <p>Comprehensive Risk Evaluation</p>
            </div>
          </div>

          <div class="meta">
            <p><strong>Date Generated:</strong> ${formattedCurrentDate}</p>
            <p><strong>Risk Level:</strong> ${label}</p>
            <p><strong>Score:</strong> ${numericScore} out of 15</p>
          </div>

          <div class="section">
            <div class="section-title">Recommendations</div>
            <p>${recommendation}</p>
          </div>

          <div class="section">
            <div class="section-title">Critical Facilities Near You</div>
            ${facilities.map(facility => `
              <div class="facility-item">
                • ${facility.label}
                <div class="facility-distance">
                  ${facility.distance ? formatDistance(facility.distance) : 'Distance unknown'}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>This assessment is generated based on your responses to the flood preparedness questionnaire.</p>
            <p>© ${currentDate.getFullYear()} Inspectify. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
  };

  const handlePreview = () => {
    const html = generatePreviewHtml();
    setPreviewHtml(html);
    setIsPreviewVisible(true);
  };

  const handleDownload = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: previewHtml,
        width: 612,
        height: 792,
      });

      const downloadDir = FileSystem.documentDirectory;
      const fileName = `flood_results_${new Date().getTime()}.pdf`;
      const destinationUri = `${downloadDir}${fileName}`;

      await FileSystem.copyAsync({
        from: uri,
        to: destinationUri
      });

      setIsPreviewVisible(false);
      alert('PDF has been downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        source={require('../../../assets/videos/houses.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isMuted
        isLooping
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <Animated.View style={[styles.loadingIcon, { transform: [{ scale: pulseAnim }] }]}>
              <MaterialIcons name="sync" size={40} color="#19477B" />
            </Animated.View>
            <Text style={styles.loadingText}>Loading your results...</Text>
          </View>
        </View>
      ) : (
        <>
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
                    
            <TouchableOpacity style={styles.downloadButton} onPress={handlePreview}>
              <MaterialIcons name="visibility" size={24} color="#fff" />
              <Text style={styles.downloadButtonText}>Preview & Download</Text>
            </TouchableOpacity>

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
                {recommendation}
              </Text>

              <Text style={styles.modalTitle}>Critical Facilities Near You</Text>

              <View style={styles.criticalFacilities}>
                {facilities.length === 0 && (
                  <Text style={styles.recommendationText}>No facilities found or still loading...</Text>
                )}
                {facilities.map((facility, index) => (
                  <View key={index} style={styles.facilityItem}>
                    <MaterialIcons name={facility.icon} size={24} color={facility.color} />
                    <View style={styles.facilityInfo}>
                      <Text style={styles.facilityText}>{facility.label}</Text>
                      <Text style={styles.distanceText}>
                        {facility.distance ? formatDistance(facility.distance) : 'Distance unknown'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Modalize>

          {/* Preview Modal */}
          <Modal
            visible={isPreviewVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsPreviewVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.previewContainer}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>Preview Results</Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setIsPreviewVisible(false)}
                  >
                    <MaterialIcons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <WebView
                  source={{ html: previewHtml }}
                  style={styles.webview}
                  scrollEnabled={true}
                />
                
                <View style={styles.previewActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => setIsPreviewVisible(false)}
                  >
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.downloadButton]}
                    onPress={handleDownload}
                  >
                    <MaterialIcons name="download" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Download PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
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
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  facilityInfo: {
    marginLeft: 10,
    flex: 1,
  },
  facilityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#19477B',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#19477B',
  },
  closeButton: {
    padding: 4,
  },
  webview: {
    flex: 1,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingIcon: {
    marginBottom: 10,
    transform: [{ scale: 1 }],
    opacity: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#19477B',
    fontWeight: '600',
  },
});

export default Results;