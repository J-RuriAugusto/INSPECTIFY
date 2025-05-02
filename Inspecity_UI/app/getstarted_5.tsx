import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const GettingStarted5 = () => {
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

  const handleNavigateToDashboard = () => {
    router.push('/Dashboard/board'); // Navigate to the next screen
  };

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

const getStyles = (width: number, height: number) => StyleSheet.create({
    container: {
      flex: 1,
    },
    upperSection: {
      flex: 1,
      backgroundColor: '#0B417D',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: width * 1,
      height: height * 1,
    },
    lowerSection: {
      flex: 1.05,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      padding: width * 0.05,
    },
    title1: {
      fontSize: 25,
      color: '#05173F',
      textAlign: 'center',
      fontFamily: 'Epilogue-Black',
      letterSpacing: 1,
      marginBottom: 5,
      marginTop: height * 0.05,
    },
    subtitle1: {
      fontSize: 15,
      color: '#7C7C7C',
      textAlign: 'center',
      fontFamily: 'Archivo-Regular',
      letterSpacing: 1,
    },
    subtitle2: {
      fontSize: width * 0.04,
      color: '#7C7C7C',
      textAlign: 'center',
      marginBottom: height * 0.05,
      fontFamily: 'Archivo-Regular',
      letterSpacing: 1,
    },
    progressBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 35,
      marginTop: -height * 0.04,
    },
    progressStep: {
      width: width * 0.13,
      height: 5,
      borderRadius: 10,
    },
    progressStepActive: {
      backgroundColor: '#0B417D',
    },
    progressStepInactive: {
      backgroundColor: '#E0E0E0',
    },
    button: {
      backgroundColor: '#08294E',
      paddingVertical: 12,
      paddingHorizontal: width * 0.25,
      borderRadius: 30,
      alignItems: 'center',
      marginTop: height * 0.03,
    },
    buttonText: {
      fontSize: 16,
      color: '#FFFFFF',
      fontFamily: 'Archivo-Bold',
    },
  });

export default GettingStarted5;