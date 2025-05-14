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
    if (numericScore <= 5) return { label: 'Low Risk', color: '#4CAF50' };
    if (numericScore <= 10) return { label: 'Moderate Risk', color: '#FFC107' };
    return { label: 'High Risk', color: '#F44336' };
  };

  const { label, color } = getRiskLevel();

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        source={require('../../../assets/videos/houses2.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isMuted
        isLooping
      />

      {/* Top Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Earthquake Preparedness Result</Text>
        
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
        modalHeight={height - 400}
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

});

export default Results;
