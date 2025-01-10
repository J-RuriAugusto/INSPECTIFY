import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated, { Easing, withTiming } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';


const GettingStarted = () => {
  const router = useRouter();
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  });

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Replace `timing` with `withTiming` for v2.
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
    <Animated.View style={[styles.container,{ opacity, transform: [{ scale }] }]}> {/* Wrap with Animated.View */}
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
    marginBottom: 20,
    fontFamily: 'Archivo-Regular',
    letterSpacing: 1,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
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
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
});

export default GettingStarted;
