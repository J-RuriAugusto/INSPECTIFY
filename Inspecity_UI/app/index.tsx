import React, { useEffect, useState } from 'react';
import { View, Text, Button, StatusBar, ActivityIndicator, Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import useUserID from "./useUserID"

const LoadingScreen = () => {
  const router = useRouter();
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const userId = useUserID();
  const API_KEY = 'BT_1smAfCA4roEldR7S9LObSgdbZ7uGAF2HJvs5VQyY';

  useEffect(() => {
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
        router.replace('../board/dashboard');
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

  const handleGetStarted = async () => {
    if (userId) {
      // If we have a userId, check if it exists in backend
      await checkUserIdInDatabase(userId);
    } else {
      // No userId, go directly to getstarted_1
      router.replace('/getstarted_1');
    }
  };

  return (
    <View style={styles.container}>
      {/* Hide Status Bar */}
      <StatusBar hidden={true} />

      <Text style={styles.title}>LOADING VIDEO</Text>
      <Text style={styles.subtitle}>Loading animation is here.</Text>
      <Button 
        title="Get started" 
        onPress={handleGetStarted} 
        disabled={isCheckingUser}
      />
      {isCheckingUser && <ActivityIndicator size="small" color="#0000ff" />}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555555',
  },
};

export default LoadingScreen;