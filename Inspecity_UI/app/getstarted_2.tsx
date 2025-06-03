import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from '../hooks/useTranslation';


const GettingStarted2 = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [homeName, setHomeName] = useState(''); // State to store the home name
  const [houseAge, setHouseAge] = useState(''); // State to store the age of the house
  const [houseUse, setHouseUse] = useState(''); // State to store the primary use of the house
  const [renovations, setRenovations] = useState(''); // State to store if the house underwent renovations


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
    if (!homeName.trim()) {
      Alert.alert(t('ERROR'), t('HOME_NAME_REQ'));
      return;
    }
  
    if (!houseAge.trim()) {
      Alert.alert(t('ERROR'), t('HOME_AGE_REQ'));
      return;
    }
  
    let age = parseInt(houseAge, 10);
  
    if (isNaN(age) || age <= 0) {
      Alert.alert(t('ERROR'), t('ERROR_INVALID_AGE'));
      return;
    }
  
    setHouseAge(age.toString()); // Ensure UI reflects parsed value
  
    const homeData = JSON.stringify({ 
      homeName, 
      houseAge: age,
      houseUse: houseUse.trim() !== "" ? houseUse : null, 
      renovations: renovations.trim() !== "" ? renovations : null
    });
  
    router.push({
      pathname: '/getstarted_3',
      params: { homeData },
    });
  };
  
  
  
  

  const currentStep = 2; // Current progress step

  return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
  behavior="height" // best for Android
  keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <Animatable.View
      style={styles.container}
      animation="fadeIn"
      duration={600}
      easing="ease-out"
    >
      {/* Upper Blue Section */}
      <View style={styles.upperSection}>
<Animatable.Image
    animation="slideInRight"
    duration={800}
    easing="ease-out"
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
                index < currentStep ? styles.progressStepActive : styles.progressStepInactive 
              ]}
            />
          ))}
        </View>

        <Text style={styles.title1}>{t('ADD_HOME')}</Text>
        <Text style={styles.subtitle1}>{t('BASIC_HOME_DETAILS')}</Text>
        <Text style={styles.subtitle2}>{t('BASIC_HOME_DETAILS2')}</Text>

        {/* Home Name Text Input */}
        <TextInput
          style={[styles.textBox, styles.lowerPlaceholder]}
          placeholder={t('ENTER_HOME_NAME')}
          placeholderTextColor="#BBBBBB"
          value={homeName}
          onChangeText={(text) => setHomeName(text)}
        />

        {/* House Age Text Input */}
        <TextInput
          style={[styles.textBox, styles.lowerPlaceholder]}
          placeholder={t('ENTER_HOUSE_AGE')}
          placeholderTextColor="#BBBBBB"
          value={houseAge}
          onChangeText={(text) => setHouseAge(text)}
        />

        {/* Primary Use Text Input */}
        <TextInput
          style={[styles.textBox, styles.lowerPlaceholder]}
          placeholder={t('ENTER_PRIMARY_USE')}
          placeholderTextColor="#BBBBBB"
          value={houseUse}
          onChangeText={(text) => setHouseUse(text)}
        />

        <Text style={styles.label}>{t('HAS_RENOVATIONS')}</Text>
        <Text style={styles.label}>{t('HAS_RENOVATIONS2')}</Text>

        {/* Renovations Text Input */}
        <TextInput
          style={[styles.textBox, styles.lowerPlaceholder]}
          placeholder={t('RENOVATIONS_GUIDE')}
          placeholderTextColor="#BBBBBB"
          value={renovations}
          onChangeText={(text) => setRenovations(text)}
        />

        {/* Custom Button */}
        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted3}>
          <Text style={styles.buttonText}>{t('NEXT')}</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
     </ScrollView>
    </KeyboardAvoidingView>
  </TouchableWithoutFeedback>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  upperSection: {
    flex: 0.0005,
    backgroundColor: '#0B417D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: wp('100%'),
    height: hp('50%'),
  },
  lowerSection: {
    flex: 2,
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
    letterSpacing: wp('0.25%'),
    marginBottom: hp('0.4%'),
  },
  subtitle1: {
    fontSize: wp('4%'),
    color: '#7C7C7C',
    textAlign: 'center',
    fontFamily: 'Archivo-Regular',
    letterSpacing: wp('0.25%'),
  },
  subtitle2: {
    fontSize: wp('4%'),
    color: '#7C7C7C',
    textAlign: 'center',
    marginBottom: hp('1.2%'),
    fontFamily: 'Archivo-Regular',
    letterSpacing: wp('0.25%'),
    marginTop: hp('-1.2%'),
  },
  label: {
    fontSize: wp('3.7%'),
    color: '#05173F',
    textAlign: 'center',
    marginBottom: hp('0.7%'),
    fontFamily: 'Archivo-Regular',
    letterSpacing: wp('0.25%'),
    marginTop: hp('-1.2%'),
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp('90%'),
    marginBottom: hp('2%'),
    marginTop: -hp('2.5%'),
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
  textBox: {
    width: wp('80%'),
    height: hp('4.5%'),
    padding: wp('1%'),
    borderRadius: wp('10%'),
    fontFamily: 'Archivo-Regular',
    fontSize: wp('4%'),
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#D9D9D9',
    marginBottom: hp('1.2%'),
  },
  button: {
    marginTop: hp('1%'),
    backgroundColor: '#08294E',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('25%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
  },
  buttonText: {
    fontSize: wp('4.5%'),
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
  lowerPlaceholder: {
    textAlignVertical: 'bottom',
    paddingBottom: hp('0.7%'),
  },
});

export default GettingStarted2;