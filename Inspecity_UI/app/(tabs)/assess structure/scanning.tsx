import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const Scanning = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const photo = Array.isArray(params.photo) ? params.photo[0] : params.photo; // Ensure `photo` is a string

  useEffect(() => {
    if (photo) {
      router.push({
        pathname: '/assess structure/photoDetails',
        params: { photo },
      });
    }
  }, [photo]);

  return (
    <View style={styles.container}>
      {/* Full-screen image */}
      {photo ? (
        <Image source={{ uri: photo }} style={styles.fullScreenImage} />
      ) : (
        <Text style={styles.errorText}>No photo available</Text>
      )}

      {/* Overlay with text and loader */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Analyzing the structure</Text>
        <Text style={styles.title}>for cracks and damages...</Text>
        <ActivityIndicator size="large" color="#00A8E8" style={styles.loader} />
      </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay
  },
  title: {
    fontSize: 18,
    fontFamily: 'Epilogue-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loader: {
    marginTop: '10%',
  },
  errorText: {
    color: '#FF5B5B',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Scanning;
