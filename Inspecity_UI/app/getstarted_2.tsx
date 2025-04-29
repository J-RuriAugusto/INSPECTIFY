import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { useWindowDimensions } from 'react-native';

const GettingStarted2 = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions(); // Get device dimensions
  const [homeName, setHomeName] = useState('');
  const [houseAge, setHouseAge] = useState('');
  const [houseUse, setHouseUse] = useState('');
  const [renovations, setRenovations] = useState('');
  const styles = getStyles(width, height);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Show nothing until fonts are loaded
  }

  const handleNavigateToGetStarted3 = () => {
    router.push('/getstarted_3');
  };

  const currentStep = 2;


  return (
    <View style={styles.container}>
      {/* Upper Blue Section */}
      <View style={styles.upperSection}>
        <Image
          source={require('../assets/images/houseGS2.png')}
          style={styles.image}
          resizeMode="contain"
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

        <Text style={styles.title1}>Add Your Home</Text>
        <Text style={styles.subtitle1}>Enter basic details about your</Text>
        <Text style={styles.subtitle2}>home to begin.</Text>

        {/* Home Name Text Input */}
        <TextInput
          style={[styles.textBox, styles.lowerPlaceholder]}
          placeholder="Enter your home name"
          placeholderTextColor="#BBBBBB"
          value={homeName}
          onChangeText={(text) => setHomeName(text)}
        />

        {/* House Age Text Input */}
        <TextInput
          style={[styles.textBox, styles.lowerPlaceholder]}
          placeholder="Enter the age of the house"
          placeholderTextColor="#BBBBBB"
          value={houseAge}
          onChangeText={(text) => setHouseAge(text)}
        />

        {/* Primary Use Text Input */}
        <TextInput
          style={[styles.textBox, styles.lowerPlaceholder]}
          placeholder="Enter the primary use of the House"
          placeholderTextColor="#BBBBBB"
          value={houseUse}
          onChangeText={(text) => setHouseUse(text)}
        />

        <Text style={styles.label}>Has the house undergone</Text>
        <Text style={styles.label}>renovations or repairs?</Text>

        {/* Renovations Text Input */}
        <TextInput
          style={[styles.textBox, styles.lowerPlaceholder]}
          placeholder="Yes/No, if yes, specify"
          placeholderTextColor="#BBBBBB"
          value={renovations}
          onChangeText={(text) => setRenovations(text)}
        />

        {/* Custom Button */}
        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted3}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Responsive styles based on window width and height
const getStyles = (width: number, height: number) =>
  StyleSheet.create({
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
      width: width * 1, // Responsive width
      height: height * 1, // Responsive height
    },
    lowerSection: {
      flex: 1.05,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: width * 0.05, // Dynamic padding
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
    },
    subtitle2: {
      fontSize: 15,
      color: '#7C7C7C',
      textAlign: 'center',
      marginBottom: 10,
      fontFamily: 'Archivo-Regular',
      letterSpacing: 1,
      marginTop: -10,
    },
    label: {
      fontSize: 14,
      color: '#05173F',
      textAlign: 'center',
      marginBottom: 5,
      fontFamily: 'Archivo-Regular',
      letterSpacing: 1,
      marginTop: -10,
    },
    progressBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 6,
      marginTop: -25,
    },
    progressStep: {
      width: 50,
      height: 5,
      borderRadius: 10,
    },
    progressStepActive: {
      backgroundColor: '#0B417D',
    },
    progressStepInactive: {
      backgroundColor: '#E0E0E0',
    },
    textBox: {
      width: width * 0.8, // Responsive width
      height: 35,
      padding: 3,
      borderRadius: 25,
      fontFamily: 'Archivo-Regular',
      fontSize: 15,
      textAlign: 'center',
      textAlignVertical: 'center',
      backgroundColor: '#D9D9D9',
      marginBottom: 10,
    },
    button: {
      backgroundColor: '#08294E',
      paddingVertical: 12,
      paddingHorizontal: width * 0.25, // Responsive padding
      borderRadius: 30,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 18,
      color: '#FFFFFF',
      fontFamily: 'Archivo-Bold',
    },
    lowerPlaceholder: {
      textAlignVertical: 'bottom',
      paddingBottom: 5,
    },
  });

export default GettingStarted2;
