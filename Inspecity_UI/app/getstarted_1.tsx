import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated, { Easing, withTiming } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';
import { useWindowDimensions, Platform } from 'react-native';


const GettingStarted1 = () => {
  const router = useRouter();

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  });

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 800, easing: Easing.ease });
    opacity.value = withTiming(1, { duration: 1000, easing: Easing.ease });
  }, []);

  if (!fontsLoaded) {
    return null; // Show nothing until fonts are loaded
  }

  const handleNavigateToGetStarted = () => {
    router.push('/getstarted_2'); // Navigate to the next screen
  };

  const currentStep = 1; // Update this value dynamically for progress

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
      {/* Hide Status Bar */}
      <StatusBar hidden={true} />

      {/* Upper Blue Section */}
      <View style={styles.upperSection}>
        <Image
          source={require('../assets/images/houseGS1.png')} // Path to your image
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

        <Text style={styles.title1}>Welcome to</Text>
        <Text style={styles.title2}>Inspectify!</Text>
        <Text style={styles.subtitle1}>Let's get started with setting up</Text>
        <Text style={styles.subtitle2}>your first home.</Text>

        {/* Custom Button */}
        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  upperSection: {
    flex: 1,
    backgroundColor: '#0B417D', // Blue background
    justifyContent: 'center',
    alignItems: 'center',
  },  
  lowerSection: {
    flex: 1.1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
  },
  image: {
    width: width * 1,
    height: height * 1,
    // maxHeight: 350,
    // maxWidth: 350,
  },
  title1: {
    fontSize: 30,
    color: '#05173F',
    textAlign: 'center',
    fontFamily: 'Epilogue-Black',
    letterSpacing: 1,
    // marginBottom: 5,
    // marginTop: height * 0.02,
  },
  title2: {
    fontSize: 50,
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
    marginBottom: 20,
    fontFamily: 'Archivo-Regular',
    letterSpacing: 1,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 60,
    marginTop: -45,
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
    backgroundColor: '#08294E',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.25,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: height * 0.05,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
});

export default GettingStarted1;
