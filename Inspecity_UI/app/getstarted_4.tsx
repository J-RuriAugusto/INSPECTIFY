import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as Location from 'expo-location';
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const GettingStarted4 = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const styles = getStyles(width, height);

  const handleTurnOnLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      Alert.alert('Location Enabled', 'You have enabled location access!', [
        { text: 'OK', onPress: () => router.push('/getstarted_5') },
      ]);
    } else {
      Alert.alert('Location Denied', 'You have denied location access.', [
        { text: 'OK', onPress: () => router.push('/getstarted_5') },
      ]);
    }
  };

  const handleSkipForNow = () => {
    Alert.alert('Remind Me Later', 'You can enable location services anytime in settings.', [
      { text: 'OK', onPress: () => router.push('/getstarted_5') },
    ]);
  };

  const currentStep = 5;

  return (
    <View style={styles.container}>
      <View style={styles.upperSection}>
        <Image
          source={require('../assets/images/houseGS4.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.lowerSection}>
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

        <Text style={styles.title1}>Enable Your Location Access</Text>
        <Text style={styles.subtitle1}>
          Turn on location services to find nearby hardware shops and get accurate suggestions.
        </Text>

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
      paddingHorizontal: width * 0.05,
      paddingVertical: height * 0.03,
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
      marginBottom: 5,
    },
    progressBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 50,
      marginTop: -height * 0.05,
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
      paddingHorizontal: width * 0.2,
      borderRadius: 30,
      alignItems: 'center',
      marginBottom: 5,
      marginTop: height * 0.05,
    },
    button1: {
      backgroundColor: '#38516D',
      paddingVertical: 12,
      paddingHorizontal: width * 0.25,
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

export default GettingStarted4;
