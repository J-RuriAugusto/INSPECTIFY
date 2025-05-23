import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import axios from 'axios';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
import { WebView } from 'react-native-webview';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSettings } from '../Dashboard/settingsContext';

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
  const { t } = useTranslation();
  const { settings } = useSettings();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handlePositionChange = (position: 'initial' | 'top') => {
    setIsModalOpen(position === 'top');
  };

  const getRiskLevel = () => {
    if (numericScore <= 5) return { label: t('LOW_RISK'), color: '#2E8532' };
    if (numericScore <= 10) return { label: t('MODERATE_RISK'), color: '#DD940E' };
    return { label: t('HIGH_RISK'), color: '#A9241A' };
  };

  const { label, color } = getRiskLevel();

  const answersArray = params.answers
    ? JSON.parse(Array.isArray(params.answers) ? params.answers[0] : params.answers)
    : [];

  const [recommendation, setRecommendation] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = 'AlzaSylbH3rLRAXSI2ItbA7aFinv7hoUQIVst8Q'; // Flask
  const GOOGLE_API_KEY = 'AlzaSy6s_Afq_l4rqY4n6ZnQdoN_nJri1UlL8gi';

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
            language: settings.language,
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
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });


    // Convert markdown to HTML
    const convertMarkdownToHtml = (markdown: string) => {
      return markdown
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^\s*[-*+]\s+(.*$)/gm, '<li>$1</li>')
        // Paragraphs
        .replace(/^(?!<[h|li])(.*$)/gm, '<p>$1</p>')
        // Clean up empty paragraphs
        .replace(/<p><\/p>/g, '')
        // Wrap lists in ul tags
        .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
        // Clean up multiple ul tags
        .replace(/<\/ul><ul>/g, '');
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t('FLOOD_PREPAREDNESS_ASSESSMENT')}</title>
          <style>
            @page {
              margin: 0.5in;
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              padding: 20px;
              color: #333;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              display: flex;
              align-items: center;
              border-bottom: 2px solid #2E86C1;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header img {
              height: 80px;
              width: auto;
              margin-right: 20px;
              object-fit: contain;
            }
            .header-text h1 {
              font-size: 24px;
              color: #2E86C1;
              margin: 0 0 8px 0;
              font-weight: 600;
            }
            .header-text p {
              font-size: 16px;
              color: #666;
              margin: 0;
            }
            .meta {
              margin-bottom: 30px;
              font-size: 14px;
              color: #555;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e9ecef;
            }
            .meta p {
              margin: 8px 0;
            }
            .meta strong {
              color: #2E86C1;
              font-weight: 600;
            }
            .section {
              margin: 30px 0;
              padding: 25px;
              background: #fff;
              border-radius: 8px;
              border: 1px solid #e9ecef;
            }
            .section-title {
              font-size: 20px;
              font-weight: 600;
              color: #2E86C1;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e9ecef;
            }
            .risk-level {
              font-size: 28px;
              font-weight: bold;
              color: ${color};
              text-align: center;
              margin: 20px 0;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
              border: 1px solid #e9ecef;
            }
            .score {
              text-align: center;
              font-size: 18px;
              margin: 15px 0;
              color: #555;
            }
            .facility-item {
              margin: 12px 0;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 6px;
              border: 1px solid #e9ecef;
            }
            .facility-distance {
              font-size: 14px;
              color: #666;
              font-style: italic;
              margin-top: 5px;
            }
            .footer {
              font-size: 12px;
              text-align: center;
              color: #666;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
            }
            .recommendations {
              font-size: 16px;
              line-height: 1.8;
            }
            .recommendations h1 {
              font-size: 24px;
              color: #2E86C1;
              margin: 20px 0 15px 0;
            }
            .recommendations h2 {
              font-size: 20px;
              color: #2E86C1;
              margin: 18px 0 12px 0;
            }
            .recommendations h3 {
              font-size: 18px;
              color: #2E86C1;
              margin: 15px 0 10px 0;
            }
            .recommendations ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .recommendations li {
              margin: 8px 0;
            }
            .recommendations strong {
              color: #2E86C1;
              font-weight: 600;
            }
            .recommendations em {
              color: #666;
              font-style: italic;
            }
            .recommendations p {
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://res.cloudinary.com/dyk1pt3m0/image/upload/v1747717972/4e71edc6-3f82-4d38-86f4-b30d02dfd25c_hdhxcu.jpg" alt="Inspectify Logo" />
            <div class="header-text">
              <h1>${t('FLOOD_PREPAREDNESS_ASSESSMENT')}</h1>
              <p>${t('COMPREHENSIVE_REPORT')}</p>
            </div>
          </div>

          <div class="meta">
            <p><strong>${t('DATE_GENERATED')}:</strong> ${formattedCurrentDate}</p>
            <p><strong>${t('RISK_LEVEL')}:</strong> ${label}</p>
            <p><strong>${t('SCORE')}:</strong> ${numericScore} ${t('OUT_OF')}15</p>
          </div>

          <div class="section">
            <div class="section-title">${t('DETAILED_RECOMMENDATIONS')}</div>
            <div class="recommendations">
              ${convertMarkdownToHtml(recommendation)}
            </div>
          </div>

          <div class="section">
            <div class="section-title">${t('CRITICAL_FACILITIES_NEAR')}</div>
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
            <p>${t('FLOOD_BASED_ON_YOUR_RESPONSE')}</p>
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

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      alert('Sharing is not available on this device');
      return;
    }

    await Sharing.shareAsync(uri);
  } catch (error) {
    console.error('Error opening PDF:', error);
    alert('Failed to open PDF');
  }
};
  
  // Inside the Results component, add markdownStyles
  const markdownStyles = {
    body: {
      color: '#333',
      fontSize: 14,
      lineHeight: 20,
    },
    heading1: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2E86C1',
      marginTop: 10,
      marginBottom: 5,
    },
    heading2: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#2E86C1',
      marginTop: 8,
      marginBottom: 4,
    },
    heading3: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#2E86C1',
      marginTop: 6,
      marginBottom: 3,
    },
    list_item: {
      marginBottom: 5,
    },
    bullet_list: {
      marginBottom: 10,
    },
    ordered_list: {
      marginBottom: 10,
    },
    code_inline: {
      backgroundColor: '#f0f0f0',
      padding: 2,
      borderRadius: 3,
    },
    code_block: {
      backgroundColor: '#f0f0f0',
      padding: 10,
      borderRadius: 5,
      marginVertical: 5,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: '#2E86C1',
      paddingLeft: 10,
      marginVertical: 5,
      fontStyle: 'italic',
    },
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
            <Text style={styles.loadingText}>{t('LOADING_YOUR_RESULTS')}</Text>
          </View>
        </View>
      ) : (
        <>
          {/* Top Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{t('FLOOD_PREPAREDNESS_RESULT')}</Text>
            <Text style={[styles.riskLevel, { color }]}>{label}</Text>
            <View style={styles.barContainer}>
              <View
                style={[styles.bar, { width: `${(numericScore / 15) * 100}%`, backgroundColor: color }]}
              />
            </View>
            <Text style={styles.score}>{t('YOU_ANSWERED_YES')}{numericScore} {t('OUT_OF')}15 {t('QUESTIONS')}</Text>
                    


            <Text style={styles.swipeUpLabel}>⬆ {t('SWIPE_UP')}</Text>
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
              <Text style={styles.collapsedLabel}>{t('RECOMMENDATIONS_AND_FACILITIES')}</Text>
            </View>
            <TouchableOpacity style={styles.downloadButton} onPress={handlePreview}>
              <MaterialIcons name="visibility" size={20} color="#fff" />
              <Text style={styles.downloadButtonText}>{t('PREVIEW_AND_DOWNLOAD')}</Text>
            </TouchableOpacity>

            {/* Expanded modal content */}
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('RECOMMENDATIONS')}</Text>
              <View style={styles.recommendationContainer}>
                <Markdown style={{
                  body: styles.modalText,
                  heading1: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#2E86C1' },
                  heading2: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#2E86C1' },
                  heading3: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: '#2E86C1' },
                  bullet_list: { marginBottom: 10 },
                  list_item: { marginBottom: 5 },
                  strong: { fontWeight: 'bold', color: '#2E86C1' },
                  em: { fontStyle: 'italic', color: '#666' },
                  link: { color: '#2E86C1', textDecorationLine: 'underline' },
                }}>
                  {recommendation}
                </Markdown>
              </View>

              <Text style={styles.modalTitle}>{t('CRITICAL_FACILITIES_NEAR')}</Text>

              <View style={styles.criticalFacilities}>
                {facilities.length === 0 && (
                  <Text style={styles.recommendationText}>{t('NO_FACILITIES_FOUND')}</Text>
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
                  <Text style={styles.previewTitle}>{t('PREVIEW_RESULTS')}</Text>
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
                    <Text style={styles.actionButtonText}>{t('CANCEL')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.downloadButton]}
                    onPress={handleDownload}
                  >
                    <MaterialIcons name="download" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>{t('DOWNLOAD_PDF')}</Text>
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
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  recommendationContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginTop: -3,
    marginBottom: -3,
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
    fontSize: 12,
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
  // cancelButton: {
  //   backgroundColor: '#E55050',
  //   marginRight: 8,
  // },
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