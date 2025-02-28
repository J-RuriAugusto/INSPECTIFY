import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import * as Location from 'expo-location';

const GettingStarted = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const { homeData } = useLocalSearchParams();
  const userId = uuid.v4();
  console.log(homeData)

  const router = useRouter();

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
      } catch (error) {
        console.error(error);
      }
    };
    
    getLocation();
  }, []);

  const parsedHomeData = homeData 
  ? JSON.parse(Array.isArray(homeData) ? homeData[0] : homeData) 
  : {};

  const handleNavigateToDashboard = () => {
    const requiredFields = ['address', 'homeType', 'yearBuilt']; // Add all required fields
    const missingFields = requiredFields.filter((field) => !parsedHomeData[field]);
  
    if (missingFields.length > 0) {
      Alert.alert(
        'Reminder',
        `Some fields are skipped.\nYou can update them in Settings for better AI recommendations.`,
        [{ text: 'OK', onPress: () => navigateToDashboard() }]
      );
    } else {
      navigateToDashboard();
    }
  };
  
  const navigateToDashboard = async () => {
    const updatedHomeData = {
      ...parsedHomeData,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      homeowner_id: userId,
      is_default: true,
    };

    try{
      const homeownerResponse = await fetch('http://172.16.0.137:5000/homeowners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeowner_id: userId, // Use the generated UUID
        }),
      });
      if (!homeownerResponse.ok) {
        throw new Error('Failed to create homeowner');
      }
      console.log('Homeowner created successfully');
    
      const homeResponse = await fetch('http://172.16.0.137:5000/homes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedHomeData),
      });

      if (!homeResponse.ok) {
        throw new Error('Failed to create home');
      }
  
      console.log('Home created successfully');
  
      await AsyncStorage.setItem('userId', userId);
  
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
    }


  };

  if (!fontsLoaded) {
    return null; // Show nothing until fonts are loaded
  }

  const currentStep = 6; // Current progress step

  return (
    <View style={styles.container}>
      {/* Hide Status Bar */}
      <StatusBar hidden={true} />

      {/* Upper Blue Section */}
      <View style={styles.upperSection}>
        <Image
          source={require('../assets/images/houseGS5.png')} // Path to your image
          style={styles.image}
          resizeMode="contain" // Ensure the image fits well
        />
      </View>

      {/* Lower White Section */}
      <View style={styles.lowerSection}>
        {/* Custom Progress Bar */}
        <View style={styles.progressBar}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressStep,
                index < currentStep ? styles.progressStepActive : styles.progressStepInactive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.title1}>You're All Set!</Text>
        <Text style={styles.subtitle1}>Inspectify is ready to help you</Text>
        <Text style={styles.subtitle2}>inspect your home.</Text>

        {/* Custom Button */}
        <TouchableOpacity style={styles.button} onPress={handleNavigateToDashboard}>
          <Text style={styles.buttonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  upperSection: {
    flex: 1,
    backgroundColor: '#0B417D', // Blue background
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 400, // Adjust height as needed
  },
  lowerSection: {
    flex: 1.05,
    backgroundColor: '#FFFFFF', // White background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title1: {
    fontSize: 25,
    color: '#05173F',
    textAlign: 'center',
    fontFamily: 'Epilogue-Black',
    letterSpacing: 1,
    marginBottom: 5,
  },
  subtitle1: {
    fontSize: 15,
    color: '#7C7C7C',
    textAlign: 'center',
    fontFamily: 'Archivo-Regular',
    letterSpacing: 1,
  },
  subtitle2: {
    fontSize: 15,
    color: '#7C7C7C',
    textAlign: 'center',
    marginBottom: 50,
    fontFamily: 'Archivo-Regular',
    letterSpacing: 1,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    marginTop: -100,
  },
  progressStep: {
    width: 50,
    height: 5,
    borderRadius: 10,
  },
  progressStepActive: {
    backgroundColor: '#0B417D', // Active color
  },
  progressStepInactive: {
    backgroundColor: '#E0E0E0', // Inactive color
  },
  button: {
    backgroundColor: '#08294E', // Custom button color
    paddingVertical: 12,
    paddingHorizontal: 90,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 70
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
});

export default GettingStarted;
