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

const styles = StyleSheet.create({
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
    width: wp('100%'),
    height: hp('50%'),
  },
  lowerSection: {
    flex: 1.05,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  title1: {
    fontSize: wp('6.5%'),
    color: '#05173F',
    textAlign: 'center',
    fontFamily: 'Epilogue-Black',
    letterSpacing: 1,
    marginBottom: hp('1.2%'),
    marginTop: hp('6%'),
  },
  subtitle1: {
    fontSize: wp('4%'),
    color: '#7C7C7C',
    textAlign: 'center',
    fontFamily: 'Archivo-Regular',
    letterSpacing: 1,
  },
  subtitle2: {
    fontSize: wp('4%'),
    color: '#7C7C7C',
    textAlign: 'center',
    marginBottom: hp('7.5%'),
    fontFamily: 'Archivo-Regular',
    letterSpacing: 1,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp('90%'),
    marginBottom: hp('5%'),
  },
  progressStep: {
    width: wp('13%'),
    height: hp('0.6%'),
    borderRadius: wp('2.5%'),
  },
  progressStepActive: {
    backgroundColor: '#0B417D',
  },
  progressStepInactive: {
    backgroundColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#08294E',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('24%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
    marginBottom: hp('4%'),
  },
  buttonText: {
    fontSize: wp('4.2%'),
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
});

export default GettingStarted5;