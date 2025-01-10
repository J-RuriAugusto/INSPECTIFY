import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import the Picker component
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';


const GettingStarted = () => {
  const router = useRouter();
  const [Age, setAge] = useState('');
  const [Height, setHeight] = useState('');
  const [selectedOption, setSelectedOption] = useState(""); // State for dropdown selection


  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Show nothing until fonts are loaded
  }

  const handleNavigateToGetStarted4 = () => {
    router.push('/getstarted_4'); // Navigate to the dashboard when the button is pressed
  };

  const currentStep = 3;

  return (
    <View style={styles.container}>
      {/* Upper Blue Section */}
      <View style={styles.upperSection}>
        <Image
          source={require('../assets/images/houseGS3.png')} // Path to your image
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

        <Text style={styles.title1}>Tell Us About Your Home</Text>
        <Text style={styles.subtitle1}>Enter basic details about your home to begin.</Text>
        <View style={styles.pickerContainer}>
        <Picker
  selectedValue={selectedOption}
  onValueChange={(itemValue) => setSelectedOption(itemValue)}
  style={[
    styles.picker,
    { fontSize: 12, color: selectedOption ? '#05173F' : '#BBBBBB' }, // Dynamic font size and color
  ]}
  itemStyle={styles.pickerItem} // Styles for options (iOS only)
>
  {/* Placeholder */}
  {selectedOption === "" && (
    <Picker.Item 
      label="Select a Material" 
      value="" 
      style={styles.placeholder} 
      enabled={false} // Disable the placeholder option
    />
  )}
  {/* Actual Options */}
  <Picker.Item label="Brick" value="brick" />
  <Picker.Item label="Wood" value="wood" />
  <Picker.Item label="Concrete" value="concrete" />
  <Picker.Item label="Mixed" value="mixed" />
</Picker>

        </View>


        {/* Text Input Box */}
        <TextInput
          style={styles.textBox}
          placeholder="Enter the Age of the House"
          placeholderTextColor="#BBBBBB"
          value={Age}
          onChangeText={(text) => setAge(text)}
        />

        {/* Text Input Box */}
        <TextInput
          style={styles.textBox}
          placeholder="Enter the Height of the House"
          placeholderTextColor="#BBBBBB"
          value={Height}
          onChangeText={(text) => setHeight(text)}
        />

        {/* Custom Button */}
        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted4}>
          <Text style={styles.buttonText}>Next</Text>
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
    fontSize: 23,
    color: '#05173F',
    textAlign: 'center',
    fontFamily: 'Epilogue-Black',
    letterSpacing: 1,
    marginBottom: 3,
    marginTop: -12,
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
    marginBottom: 10,
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
    width: '70%',
    height: 40,
    borderColor: '#A0A0A0',
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop:-5,
    fontFamily: 'Archivo-Regular',
    fontSize: 13,
    color: '#05173F',
    textAlign: 'center',
    backgroundColor: '#D9D9D9',
  },
    pickerContainer: {
      width: '60%',
      backgroundColor: '#D9D9D9', // Light gray background
      borderRadius: 25, // Smooth rounded corners
      borderWidth: 2,
      borderColor: '#A0A0A0',
      overflow: 'hidden', // Ensures the borderRadius is applied
      marginBottom: 10,
      marginTop: -5,
      fontSize: 12,
      height: 50,
      textAlign: 'center',
      textAlignVertical: 'top',
    },
    picker: {
      height: 50,
      fontSize: 12, // Font size for the picked option
      color: '#05173F', // Color for the picked option
      textAlignVertical: 'top',
    },
    pickerItem: {
      fontSize: 12, // Font size for options (iOS only)
      color: '#05173F', // Color for options
      textAlignVertical: 'top',
    },
    placeholder: {
      fontSize: 14,
      color: '#BBBBBB', // Placeholder text color
      textAlignVertical: 'top',
    },
  
  button: {
    backgroundColor: '#08294E', // Custom button color
    paddingVertical: 10,
    paddingHorizontal: 90,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: -5,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
});

export default GettingStarted;
