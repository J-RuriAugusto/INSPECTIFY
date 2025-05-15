import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Alert, BackHandler, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import useUserID from "./useUserID";

const LoadingScreen = () => {
  const router = useRouter();
  const video = useRef(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const userId = useUserID();
  const API_KEY = 'BT_1smAfCA4roEldR7S9LObSgdbZ7uGAF2HJvs5VQyY';
  const [showLanguageOverlay, setShowLanguageOverlay] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); // to prevent double nav


  useEffect(() => {
    // Check internet connection
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your internet connection and try again.",
          [
            { text: "OK", onPress: () => BackHandler.exitApp() }
          ]
        );
      }
    });

    return () => unsubscribe();
  }, []);

  const checkUserIdInDatabase = async (userId: string) => {
    try {
      setIsCheckingUser(true);

      const response = await fetch(
        `https://flask-railway-sample-production.up.railway.app/check_homeowner/${userId}`,
        {
          method: 'GET',
          headers: {
            'X-API-KEY': API_KEY,
          },
        }
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          Alert.alert(
            "Service Unavailable",
            "The service is currently unavailable. Please try again later.",
            [
              { text: "OK", onPress: () => BackHandler.exitApp() }
            ]
          );
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(data);
      
      if (!data.exists) {
        await AsyncStorage.removeItem('userId');
        console.log('userId removed from AsyncStorage');
        router.replace('/getstarted_1');
      } else {
        router.replace('/(tabs)/Dashboard/board');
      }
    } catch (error) {
      console.error('Failed to check userId in database:', error);
      Alert.alert(
        "Error",
        "Failed to verify user. Please check your internet connection and try again.",
        [
          { text: "OK", onPress: () => BackHandler.exitApp() }
        ]
      );
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handlePlaybackStatusUpdate = async (status) => {
    if (status.didJustFinish && !isNavigating) {
      setIsNavigating(true); // avoid repeated calls
      if (userId) {
        await checkUserIdInDatabase(userId);
      } else {
        setShowLanguageOverlay(true);
      }
    }
  };

  const handleLanguageSelect = async (lang: string) => {
    try {
      await AsyncStorage.setItem('preferredLanguage', lang);
    } catch (err) {
      console.error('Error saving language:', err);
    }
    router.replace('/getstarted_1');
  };

  const handleSkip = () => {
    if (userId) {
      checkUserIdInDatabase(userId);
    } else {
      setShowLanguageOverlay(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Hide Status Bar */}
      <StatusBar hidden={true} />
      
      <Text style={styles.title}>LOADING VIDEO</Text>
      <Video
        ref={video}
        style={styles.video}
        source={require('../assets/videos/LOADINGSCREEN2.mp4')}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isMuted
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
      
      {/* Conditionally render the Skip button only if there's user data (userId) */}
      {userId && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>
      )}
      
      <Text style={styles.description}>Loading animation is here.</Text>
      
      {isCheckingUser && <ActivityIndicator size="small" color="#0000ff" />}
      
      {showLanguageOverlay && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Choose Your Language</Text>
            <Text style={styles.modalSubtitle}>Your language preference can be changed at any time in Settings</Text>

            <View style={styles.languageButtons}>
              <Text style={styles.languageOption} onPress={() => handleLanguageSelect('English')}>          English          </Text>
              <Text style={styles.languageOption} onPress={() => handleLanguageSelect('Filipino')}>         Tagalog         </Text>
              <Text style={styles.languageOption} onPress={() => handleLanguageSelect('Cebuano')}>        Cebuano        </Text>
 


            </View>
          </View>
        </View>
      )}
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
    width: 1000,
    height: 800,
    marginRight: 7
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#00000080', // semi-transparent background
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '85%',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',

  },
  languageOption: {
    fontSize: 18,
    color: '#FFFFFF',
    marginVertical: 3,
    paddingVertical: 10,
    justifyContent: 'center',
    backgroundColor: '#08294E',
    borderRadius: 30,
  },
});

export default LoadingScreen;
