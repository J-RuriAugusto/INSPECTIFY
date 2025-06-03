import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, Alert, BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import * as Location from 'expo-location';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from '../hooks/useTranslation';

const GettingStarted5 = () => {
  const { t } = useTranslation();
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const { homeData } = useLocalSearchParams();
  const userId = uuid.v4();
  const API_KEY = '***REMOVED***';
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
    const requiredFields = [
      'homeName',
      'houseAge',
      'houseUse',
      'renovations',
      'typeOfHouse',
      'numFloor',
      'lotArea',
      'floorArea',
      'selectedHouseType',
      'selectedMaterial',
      'selectedFlooring',
      'selectedWall',
      'selectedCeiling',
      'latitude',
      'longitude',
    ];
    const missingFields = requiredFields.filter((field) => !parsedHomeData[field]);
  
    if (missingFields.length > 0) {
      Alert.alert(
        t('REMINDER'),
        t('SOME_FIELDS_ARE_SKIPPED'),
        [{ text: t('OK'), onPress: () => navigateToDashboard() }]
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
        throw new Error(t('FAILED_HOMEOWNER_CREATION'));
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
        throw new Error(t('FAILED_HOME_CREATION'));
      }
      console.log(JSON.stringify(updatedHomeData))
      console.log('Home created successfully');
  
      await AsyncStorage.setItem('userId', userId);
  
      router.push('/(tabs)/Dashboard/board');
    } catch (error) {
      Alert.alert(
        t('ERROR'),
        t('FAILED_HOMEOWNER_CREATION2'),
        [{ text: t('OK'), onPress: () => BackHandler.exitApp() }]
      );
    }
  };

  if (!fontsLoaded) {
    return null; // Show nothing until fonts are loaded
  }

  const currentStep = 6; // Current progress step

  return (
<Animatable.View
      style={styles.container}
      animation="fadeIn"
      duration={600}
      easing="ease-out"
    >
      <View style={styles.upperSection}>
<Animatable.Image
    animation="slideInRight"
    duration={800}
    easing="ease-out"
    source={require('../assets/images/houseGS5.png')}
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

        <Text style={styles.title1}>{t('ALL_SET')}</Text>
        <Text style={styles.subtitle1}>{t('READY_TO_HELP')}</Text>
        <Text style={styles.subtitle2}>{t('READY_TO_HELP2')}</Text>

        {/* Custom Button */}
        <TouchableOpacity style={styles.button} onPress={handleNavigateToDashboard}>
          <Text style={styles.buttonText}>{t('GO_TO_DASHBOARD')}</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
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
    marginTop: hp('-8%'),
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