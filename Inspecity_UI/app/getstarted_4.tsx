import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import * as Location from 'expo-location';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from '../hooks/useTranslation';

const GettingStarted4 = () => {
  const { t } = useTranslation();
  const { homeData } = useLocalSearchParams();
  console.log(homeData)
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

  const handleTurnOnLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      Alert.alert(
        t('LOCATION_ENABLED'),
        t('LOCATION_ENABLED_DESCRIPTION'),
        [{ text: t('OK'), onPress: () => router.push({pathname: '/getstarted_5', params: { homeData }}) }] // Navigate to the next screen
      );
    } else {
      Alert.alert(
        t('LOCATION_DENIED'),
        t('LOCATION_DENIED_DESCRIPTION'),
        [{ text: t('OK'), onPress: () => router.push({pathname: '/getstarted_5', params: { homeData }}) }] // Navigate to the next screen
      );
    }
  };

  const handleSkipForNow = () => {
    Alert.alert(
      t('REMIND_ME_LATER'),
      t('ENABLE_LOCATION_IN_SETTINGS'),
      [{ text: t('OK'), onPress: () => router.push({pathname: '/getstarted_5', params: { homeData }}) }] // Navigate to the next screen
    );
  };


  const handleNavigateToGetStarted5 = () => {
    router.push({
      pathname: '/getstarted_5',
      params: { homeData },
    });
  };

  const currentStep = 5; // Current progress step

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
    source={require('../assets/images/houseGS4.png')}
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

        <Text style={styles.title1}>{t('ENABLE_LOCATION')}</Text>
        <Text style={styles.subtitle1}>{t('TURN_ON_LOCATION_DESCRIPTION')}</Text>

        {/* Custom Button */}
        <TouchableOpacity style={styles.button} onPress={handleTurnOnLocation}>
          <Text style={styles.buttonText}>{t('TURN_ON_LOCATION')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button1} onPress={handleSkipForNow}>
          <Text style={styles.buttonText}>{t('SKIP_FOR_NOW')}</Text>
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
    fontSize: wp('6%'),
    color: '#05173F',
    textAlign: 'center',
    fontFamily: 'Epilogue-Black',
    letterSpacing: 1,
    marginBottom: hp('1%'),
  },
  subtitle1: {
    fontSize: wp('4%'),
    color: '#7C7C7C',
    textAlign: 'center',
    fontFamily: 'Archivo-Regular',
    letterSpacing: 1,
    marginBottom: hp('7.5%'),
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp('90%'),
    marginBottom: hp('7.5%'),
    marginTop: -hp('5.5%'),
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
    paddingHorizontal: wp('20%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  button1: {
    backgroundColor: '#38516D',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('24%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
  },
  buttonText: {
    fontSize: wp('4.2%'),
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
});

export default GettingStarted4;