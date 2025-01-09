import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';

const GettingStarted = () => {
  const router = useRouter();

    // Load custom fonts
    const [fontsLoaded] = useFonts({
      'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
      'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
      'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),

    });
  
    if (!fontsLoaded) {
      return <AppLoading />;
    }

  const handleNavigateToGetStarted = () => {
    router.push('/getstarted_2'); // Navigate to the dashboard when the button is pressed
  };

  return (
    <View style={styles.container}>
      {/* Upper Blue Section */}
      <View style={styles.upperSection}>
        {/* Replace this with your image */}
        <Image
          source={require('../assets/images/houseGS1.png')} // Path to your image
          style={styles.image}
          resizeMode="contain" // Ensure the image fits well
        />
      </View>

      {/* Lower White Section */}
      <View style={styles.lowerSection}>
        <Text style={styles.title1}>Welcome to</Text>
        <Text style={styles.title2}>Inspectify!</Text>
        <Text style={styles.subtitle1}>
          Let's get started with setting up
        </Text>
        <Text style={styles.subtitle2}>
          your first home.
        </Text>
        {/* Custom Button */}
        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted}>
          <Text style={styles.buttonText}>Start</Text>
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
    width: '95%', // Adjust width to your preference
    height: 400,  // Adjust height to your preference
    position: 'top', // Position the image at the top
    top: 10,       // Distance from the top
    left: 5,
  },
  lowerSection: {
    flex: 1,
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
    color: '#7C7C7C', // Black text to contrast with white background
    textAlign: 'center',
    fontFamily: 'Archivo-Regular',
    letterSpacing: 1,
  },
  subtitle2: {
    fontSize: 15,
    color: '#7C7C7C', // Black text to contrast with white background
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Archivo-Regular',
    letterSpacing: 1,

  },
  button: {
    backgroundColor: '#08294E', // Custom button color (orange)
    paddingVertical: 12, // Vertical padding
    paddingHorizontal: 90, // Horizontal padding
    borderRadius: 30, // Rounded corners
    alignItems: 'center', // Center text horizontally
  },
  buttonText: {
    fontSize: 18, // Custom font size
    color: '#FFFFFF', // White text color
    fontFamily: 'Archivo-Bold',
    fontWeight: 'bold',
  },
});

export default GettingStarted;
