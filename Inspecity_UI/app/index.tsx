import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';

const LoadingScreen = () => {
  const router = useRouter();
  const video = useRef(null);

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      router.replace('/getstarted_1'); // replace instead of push to avoid back to loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LOADING VIDEO</Text>
      <Video
        ref={video}
        style={styles.video}
        source={require('../assets/videos/LOADINGSCREEN.mp4')}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isMuted
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
      <Text style={styles.description}>Loading animation is here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  video: {
    width: 500,
    height: 200,
  },
});

export default LoadingScreen;
