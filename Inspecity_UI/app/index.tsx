import React, { useEffect, useState } from 'react';
import { View, Text, Button, StatusBar, ActivityIndicator, Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import useUserID from "./useUserID"

const LoadingScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Tracks if userId is being fetched
  const [userIdFetched, setUserIdFetched] = useState(false); // Tracks if userId fetch is complete
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

  // Automatically remove userId when the component mounts
  // useEffect(() => {
  //   const removeUserId = async () => {
  //     try {
  //       await AsyncStorage.removeItem('userId'); // Remove userId
  //       console.log('userId removed successfully');
  //     } catch (error) {
  //       console.error('Failed to remove userId:', error);
  //     }
  //   };

  //   removeUserId(); // Call the function to remove userId
  // }, []); // Empty dependency array ensures this runs only once when the component mounts

  useEffect(() => {
    const checkUserIdInDatabase = async (userId: string) => {
      try {
        setLoading(true);
  
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
            // Backend is not available
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
        } else {
          router.replace('../dashboard/dashboard');
        }
      } catch (error) {
        console.error('Failed to check userId in database:', error);
        // Don't remove userId here - just alert the user
        Alert.alert(
          "Error",
          "Failed to verify user. Please check your internet connection and try again.",
          [
            { text: "OK", onPress: () => BackHandler.exitApp() }
          ]
        );
      } finally {
        setUserIdFetched(true);
        setLoading(false);
      }
    };
  
    // Only proceed if userId is defined and not null/empty
    if (userId) {
      checkUserIdInDatabase(userId);
    } else {
      // If userId is null or empty, mark fetch as complete and stop loading
      setUserIdFetched(true);
      setLoading(false);
    }
  }, [userId, router]); // Add userId and router as dependencies

  const handleNavigateToGetStarted = () => {
    router.push('/getstarted_1'); // Navigate to the dashboard when the button is pressed
  };

  // Show loading indicator while fetching userId
  if (!userIdFetched) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ fontSize: 24, marginTop: 20 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hide Status Bar */}
      <StatusBar hidden={true} />

      <Text style={styles.title}>LOADING VIDEO</Text>
      <Text style={styles.subtitle}>Loading animation is here.</Text>
      <Button title="Get started" onPress={handleNavigateToGetStarted} />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff', // Optional: Change background color if needed
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold', // Optional styling
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555555', // Optional styling for subtitle color
  },
};

export default LoadingScreen;
