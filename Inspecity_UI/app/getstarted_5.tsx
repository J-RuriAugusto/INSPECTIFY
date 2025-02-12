import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import * as Location from 'expo-location';

const GettingStarted = () => {
  const { homeName, material, age, height } = useLocalSearchParams();
  const homeNameString = Array.isArray(homeName) ? homeName[0] : homeName;
  const materialString = Array.isArray(material) ? material[0] : material;
  const ageString = Array.isArray(age) ? age[0] : age;
  const heightString = Array.isArray(height) ? height[0] : height;
  const userId = uuid.v4(); // Generate a new unique ID

  console.log(userId, homeNameString, materialString, ageString, heightString);
  const router = useRouter();


  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Show nothing until fonts are loaded
  }

  const handleNavigateToDashboard = async () => {
    try {
      // Step 1: Create a homeowner
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
  
      // Step 2: Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      let latitude = null;
      let longitude = null;
  
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
      } else {
        console.warn('Permission to access location was denied');
      }
  
      // Step 3: Create a home for the homeowner
      const homeResponse = await fetch('http://172.16.0.137:5000/homes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeowner_id: userId,
          homeName: homeNameString,
          material: materialString,
          age: parseInt(ageString),
          height: parseFloat(heightString),
          is_default: true, // Assuming this is the primary home
          latitude, // Will be null if permission was denied
          longitude,
        }),
      });
  
      if (!homeResponse.ok) {
        throw new Error('Failed to create home');
      }
  
      console.log('Home created successfully');
  
      // Step 4: Store user ID in AsyncStorage
      await AsyncStorage.setItem('userId', userId);
  
      // Step 5: Navigate to the dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const currentStep = 5; // Current progress step

  return (
    <View style={styles.container}>
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
          {Array.from({ length: 5 }).map((_, index) => (
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
    flex: 1.5,
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
  title2: {
    fontSize: 40,
    color: '#2852AE',
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 15,
    fontFamily: 'Epilogue-Black',
    letterSpacing: 1.5,
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
    marginTop:5,

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

  textBox: {
    width: '80%',
    height: 50,
    borderColor: '#A0A0A0',
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: '#05173F',
    textAlign: 'center',
    backgroundColor: '#D9D9D9',
  },

  button: {
    backgroundColor: '#08294E', // Custom button color
    paddingVertical: 12,
    paddingHorizontal: 90,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
});


export default GettingStarted;
