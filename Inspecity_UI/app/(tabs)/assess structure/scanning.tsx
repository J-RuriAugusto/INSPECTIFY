import React, { useEffect, useRef } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, Dimensions, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const Scanning = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const photo = Array.isArray(params.photo) ? params.photo[0] : params.photo; // Ensure `photo` is always a string

  // Animation for scanning line movement
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (photo) {
      router.push({
        pathname: '/assess structure/photoDetails',
        params: { photo },
      });
    }

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
  }, [photo]);

  return (
    <View style={styles.container}>
      {/* Full-screen image */}
      {photo ? (
        <Image source={{ uri: photo }} style={styles.fullScreenImage} />
      ) : (
        <Text style={styles.errorText}>No photo available</Text>
      )}

      {/* Scanning Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Analyzing the structures</Text>
        <Text style={styles.title}>for cracks and damages...</Text>
        {/* <ActivityIndicator size="large" color="#00A8E8" style={styles.loader} /> */}
      </View>

      {/* Corner Brackets */}
      <View style={styles.cornersContainer}>
        {/* Top Left */}
        <View style={[styles.corner, styles.topLeft]} />
        {/* Top Right */}
        <View style={[styles.corner, styles.topRight]} />
        {/* Bottom Left */}
        <View style={[styles.corner, styles.bottomLeft]} />
        {/* Bottom Right */}
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
    backgroundColor: '#002B5B', // Black background in case the image is loading
  },
  fullScreenImage: {
    width: width, // Full width
    height: height, // Full height
    resizeMode: 'cover', // Cover entire screen
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent black overlay
  },
  title: {
    fontSize: 18,
    fontFamily: 'Epilogue-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center'
  },
  // loader: {
  //   marginTop: 10,
  // },
  errorText: {
    color: '#FF5B5B',
    fontSize: 18,
    textAlign: 'center',
  },

  // Corner Brackets
  cornersContainer: {
    position: 'absolute',
    top: '15.5%',
    // alignItems: 'center',
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
});

export default Scanning;
