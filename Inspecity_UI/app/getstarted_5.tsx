import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, Alert, BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import * as Location from 'expo-location';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const GettingStarted5 = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const { homeData } = useLocalSearchParams();
  const userId = uuid.v4();
  const API_KEY = 'BT_1smAfCA4roEldR7S9LObSgdbZ7uGAF2HJvs5VQyY';
  console.log(homeData)

  const router = useRouter();

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
      } catch (error) {
        console.error(error);
      }
    };
    
    getLocation();
  }, []);

  const parsedHomeData = homeData 
  ? JSON.parse(Array.isArray(homeData) ? homeData[0] : homeData) 
  : {};

  const handleNavigateToDashboard = () => {
    const requiredFields = ['address', 'homeType', 'yearBuilt']; // Add all required fields
    const missingFields = requiredFields.filter((field) => !parsedHomeData[field]);
  
    if (missingFields.length > 0) {
      Alert.alert(
        'Reminder',
        `Some fields are skipped.\nYou can update them in Settings for better AI recommendations.`,
        [{ text: 'OK', onPress: () => navigateToDashboard() }]
      );
    } else {
      navigateToDashboard();
    }
  };
  
  const navigateToDashboard = async () => {
    const updatedHomeData = {
      ...parsedHomeData,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      homeowner_id: userId,
      is_default: true,
    };

    try {
      const homeownerResponse = await fetch('https://flask-railway-sample-production.up.railway.app/homeowners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY, // Add the API key header
        },
        body: JSON.stringify({
          homeowner_id: userId, // Use the generated UUID
        }),
      });
      if (!homeownerResponse.ok) {
        throw new Error('Failed to create homeowner');
      }
      console.log('Homeowner created successfully');
    
      const homeResponse = await fetch('https://flask-railway-sample-production.up.railway.app/homes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY, // Add the API key header
        },
        body: JSON.stringify(updatedHomeData),
      });

      if (!homeResponse.ok) {
        throw new Error('Failed to create home');
      }
      console.log(JSON.stringify(updatedHomeData))
      console.log('Home created successfully');
  
      await AsyncStorage.setItem('userId', userId);
  
      router.push('/(tabs)/Dashboard/board');
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create homeowner. Try again later.',
        [{ text: 'OK', onPress: () => BackHandler.exitApp() }]
      );
    }
  };

  if (!fontsLoaded) {
    return null; // Show nothing until fonts are loaded
  }

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
    height: hp('50%'), // 400px ~ 50% of screen height on most devices
  },
  lowerSection: {
    flex: 1.05,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  title1: {
    fontSize: wp('6.5%'), // ~25px
    color: '#05173F',
    textAlign: 'center',
    fontFamily: 'Epilogue-Black',
    letterSpacing: 1,
    marginBottom: hp('1.2%'),
    marginTop: hp('6%'),
  },
  subtitle1: {
    fontSize: wp('4%'), // ~15px
    color: '#7C7C7C',
    textAlign: 'center',
    fontFamily: 'Archivo-Regular',
    letterSpacing: 1,
  },
  subtitle2: {
    fontSize: wp('4%'),
    color: '#7C7C7C',
    textAlign: 'center',
    marginBottom: hp('6%'),
    fontFamily: 'Archivo-Regular',
    letterSpacing: 1,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp('90%'),
    marginBottom: hp('2.5%'),
    marginTop: hp('-5%'),
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
    marginTop: hp('9%'),
  },
  buttonText: {
    fontSize: wp('4.2%'),
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
});

export default GettingStarted5;