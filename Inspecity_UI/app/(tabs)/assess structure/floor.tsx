import React from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';

const Typhoon = () => {
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
    'Epilogue-Medium': require('../../../assets/fonts/Epilogue-Medium.ttf'),
  });

  const navigation = useNavigation();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Container for FLOOD */}
      <View style={styles.floodContainer}>
        <Image source={require('../../../assets/images/typhoon-icon.png')} style={styles.icon} />
        <Text style={styles.floodText}>TYPHOON</Text>
      </View>

      {/* Text for LOCATION & GEOGRAPHY */}
      <Text style={styles.locationText}>LOCATION & GEOGRAPHY</Text>

      {/* Start Button */}
      <TouchableOpacity style={styles.startButton} onPress={() => alert('Start button pressed')}>
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Ensures the container takes up the full screen
    padding: 20,
    backgroundColor: '#0B417D', // Background color for the entire screen
    alignItems: 'center',
    justifyContent: 'center',  // Centers content vertically
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  backText: {
    fontFamily: 'Epilogue-Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  floodContainer: {
    flexDirection: 'row',  // Aligns the icon and text horizontally
    alignItems: 'center',  // Vertically centers the content (icon and text)
    marginBottom: 20,  // Adds space between the FLOOD section and the next one
  },
  icon: {
    width: 40,  // Adjust the size of the icon
    height: 40,
    marginRight: 10,  // Space between icon and text
  },
  floodText: {
    fontFamily: 'Epilogue-Black',  // Use the bold font
    fontSize: 30,
    color: '#FFFFFF',  // Change text color to white for better contrast
  },
  locationText: {
    fontFamily: 'Epilogue-Bold',  // Regular font
    fontSize: 50,
    color: '#00A8E8',  // Blue color for better contrast
    marginBottom: 30,  // Adds space between LOCATION text and button
  },
  startButton: {
    backgroundColor: '#00A8E8',  // Button background color
    paddingVertical: 5,  // Vertical padding for the button
    paddingHorizontal: 40,  // Horizontal padding for the button
    borderRadius: 20,  // Rounded corners for the button
  },
  startButtonText: {
    fontFamily: 'Epilogue-Black',  // Bold font for button text
    fontSize: 25,
    color: '#FFFFFF',  // White text color
  },
});

export default Typhoon;
