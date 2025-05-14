import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTranslation } from '../../../hooks/useTranslation';



interface ScanningProps {
  photo: string;
}

const { width, height } = Dimensions.get('window');

const Scanning: React.FC<ScanningProps> = ({ photo }) => {
  const { t, translateMessages } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  const scanAnim = useRef(new Animated.Value(0)).current;
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = translateMessages()

  useEffect(() => {
    // Scanning effect animation (moving up & down)
    Animated.loop(
      Animated.sequence([ 
        Animated.timing(scanAnim, {
          toValue: height * 0.68, // Move scan line down
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: height * 0.01, // Move scan line up
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate through messages every 5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 5000);

    return () => clearInterval(messageInterval);
  }, [photo]);

  return (
    <View style={styles.container}>
      {/* Full-screen image */}
      {photo ? (
        <Image source={{ uri: photo }} style={styles.fullScreenImage} />
      ) : (
        <Text style={styles.errorText}>{t('NO_PHOTO')}</Text>
      )}

      {/* Blur overlay effect - top, bottom, left, and right */}
      <BlurView style={styles.topBlur} intensity={10} tint="light" />
      <BlurView style={styles.bottomBlur} intensity={10} tint="light" />
      <BlurView style={styles.leftBlur} intensity={10} tint="light" />
      <BlurView style={styles.rightBlur} intensity={10} tint="light" />

      {/* Scanning Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.title}>{t('ANALYZING_STRUCTURES')}</Text>
        <Text style={styles.title}>{t('FOR_CRACKS')}</Text>
        {/* Informative message box */}
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{messages[currentMessage]}</Text>
        </View>
      </View>

      {/* Corner Brackets */}
      <View style={styles.cornersContainer}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      {/* Scanning Line */}
      <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanAnim }] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002B5B',
  },
  fullScreenImage: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  topBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '15%',
    zIndex: 1,
  },
  bottomBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '15%',
    zIndex: 1,
  },
  leftBlur: {
    position: 'absolute',
    top: '15%',
    left: 0,
    bottom: '15%',
    width: '10%',
    zIndex: 1,
  },
  rightBlur: {
    position: 'absolute',
    top: '15%',
    right: 0,
    bottom: '15%',
    width: '10%',
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Epilogue-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  errorText: {
    color: '#FF5B5B',
    fontSize: 18,
    textAlign: 'center',
  },

  // Corner Brackets
  cornersContainer: {
    position: 'absolute',
    top: '15.5%',
    left: '10%',
    width: '80%',
    height: '70%',
  },
  corner: {
    position: 'absolute',
    width: '20%',
    height: '15%',
    borderColor: '#00A8E8',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  // Scanning Line
  scanLine: {
    position: 'absolute',
    top: '15.5%',
    left: '10%',
    width: '80%',
    height: 4,
    backgroundColor: '#00A8E8',
    opacity: 0.8,
  },
  messageBox: {
    backgroundColor: 'transparent', 
    paddingHorizontal: 24,         
    marginTop: 30,                
    maxWidth: '90%',              
  },
  messageText: {
    fontSize: 15,              
    fontFamily: 'Epilogue-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,               
    textShadowColor: 'rgba(0, 0, 0, 0.5)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default Scanning;
