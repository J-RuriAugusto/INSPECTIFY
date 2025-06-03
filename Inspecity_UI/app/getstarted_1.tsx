import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated, { Easing, withTiming } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from '../hooks/useTranslation';

const GettingStarted1 = () => {
  const { t } = useTranslation();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        BackHandler.exitApp();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );


  // Load custom fonts
  // const [fontsLoaded] = useFonts({
  //   'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
  //   'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
  //   'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  // });

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 800, easing: Easing.ease });
    opacity.value = withTiming(1, { duration: 1000, easing: Easing.ease });
  }, []);

  // if (!fontsLoaded) {
  //   return null; // Show nothing until fonts are loaded
  // }

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

        <Text style={styles.title1}>{t('WELCOME')}</Text>
        <Text style={styles.title2}>Inspectify!</Text>
        <Text style={styles.subtitle1}>{t('GET_STARTED')}</Text>
        <Text style={styles.subtitle2}>{t('FIRST_HOME')}</Text>

        {/* Custom Button */}
        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted}>
          <Text style={styles.buttonText}>{t('START')}</Text>
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
    fontSize: wp('7%'),
    color: '#05173F',
    textAlign: 'center',
    fontFamily: 'Epilogue-Black',
    letterSpacing: wp('0.25%'),
  },
  title2: {
    fontSize: wp('11%'),
    color: '#2852AE',
    textAlign: 'center',
    marginTop: hp('-1.2%'),
    marginBottom: hp('1.8%'),
    fontFamily: 'Epilogue-Black',
    letterSpacing: wp('0.4%'),
  },
  subtitle1: {
    fontSize: wp('4%'),
    color: '#7C7C7C',
    textAlign: 'center',
    fontFamily: 'Archivo-Regular',
    letterSpacing: wp('0.3%'),
  },
  subtitle2: {
    fontSize: wp('4%'),
    color: '#7C7C7C',
    textAlign: 'center',
    marginBottom: hp('2.5%'),
    fontFamily: 'Archivo-Regular',
    letterSpacing: wp('0.3%'),
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp('90%'),
    marginBottom: hp('8%'),
    marginTop: -hp('8%'),
  },
  progressStep: {
    width: wp('12%'),
    height: hp('0.6%'),
    borderRadius: wp('3%'),
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
    paddingHorizontal: wp('25%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
    marginTop: hp('6%'),
  },
  buttonText: {
    fontSize: wp('4.5%'),
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
});

export default GettingStarted1;