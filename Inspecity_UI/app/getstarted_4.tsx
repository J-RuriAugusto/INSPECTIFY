import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import * as Location from 'expo-location';


const GettingStarted5 = () => {
  const { homeName, material, age, height } = useLocalSearchParams();
  const homeNameString = Array.isArray(homeName) ? homeName[0] : homeName;
  const materialString = Array.isArray(material) ? material[0] : material;
  const ageString = Array.isArray(age) ? age[0] : age;
  const heightString = Array.isArray(height) ? height[0] : height;

  console.log(homeNameString, materialString, ageString, heightString);
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

  const handleTurnOnLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      Alert.alert(
        'Location Enabled',
        'You have enabled location access!',
        [{ text: 'OK', onPress: handleNavigateToGetStarted5 }] // Navigate to the next screen
      );
    } else {
      Alert.alert(
        'Location Denied',
        'You have denied location access.',
        [{ text: 'OK', onPress: handleNavigateToGetStarted5 }] // Navigate to the next screen
      );
    }
  };

  const handleSkipForNow = () => {
    Alert.alert(
      'Remind Me Later',
      'You can enable location services anytime in settings.',
      [{ text: 'OK', onPress: handleNavigateToGetStarted5 }] // Navigate to the next screen
    );
  };


  const handleNavigateToGetStarted5 = () => {
    const params = new URLSearchParams();
    params.append('homeName', homeNameString);
    params.append('material', materialString);
    params.append('age', ageString);
    params.append('height', heightString);

    router.push(`/getstarted_5?${params.toString()}`);
  };

  const currentStep = 4; // Current progress step

  return (
    <View style={styles.container}>
      {/* Upper Blue Section */}
      <View style={styles.upperSection}>
        <Image
          source={require('../assets/images/houseGS4.png')} // Path to your image
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

        <Text style={styles.title1}>Enable Your Location Access</Text>
        <Text style={styles.subtitle1}>Turn on location services to find nearby hardware shops and get accurate suggestions.</Text>

        {/* Custom Button */}
        <TouchableOpacity style={styles.button} onPress={handleTurnOnLocation}>
          <Text style={styles.buttonText}>Turn on Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button1} onPress={handleSkipForNow}>
          <Text style={styles.buttonText}>Skip for Now</Text>
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
    marginBottom: 5,
  },
  subtitle2: {
    fontSize: 15,
    color: '#7C7C7C',
    textAlign: 'center',
    marginBottom: 10,
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
    paddingHorizontal: 75,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 10,
  },
  button1: {
    backgroundColor: '#38516D', // Custom button color
    paddingVertical: 12,
    paddingHorizontal: 90,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
});


export default GettingStarted5;
