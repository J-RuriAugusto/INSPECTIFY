import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, Alert, BackHandler, TextInput, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import 'react-native-get-random-values';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import * as Location from 'expo-location';
import HomeDetails from '../../../constants/HomeDetails'
import useUserID from "../../useUserID";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTranslation } from '../../../hooks/useTranslation';

const GettingStarted3b = () => {
  const { t } = useTranslation();
  const { homeData } = useLocalSearchParams();
  const userId = useUserID();
  const [location, setLocation] = useState<{latitude: number | null, longitude: number | null}>({latitude: null, longitude: null});
  const [locationError, setLocationError] = useState<string | null>(null);
  console.log(homeData)
  const router = useRouter();
  const [selectedHouseType, setSelectedHouseType] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedFlooring, setSelectedFlooring] = useState("");
  const [selectedWall, setSelectedWall] = useState("");
  const [selectedCeiling, setSelectedCeiling] = useState("");

  const [otherHouseType, setOtherHouseType] = useState('');
  const [otherMaterial, setOtherMaterial] = useState('');
  const [otherFlooring, setOtherFlooring] = useState('');
  const [otherWall, setOtherWall] = useState('');
  const [otherCeiling, setOtherCeiling] = useState('');

  const API_KEY = '***REMOVED***';

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../../../assets/fonts/Archivo-Bold.ttf'),
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } catch (error) {
        setLocationError('Failed to get location');
        console.error("Error getting location:", error);
      }
    })();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const parsedHomeData = homeData 
  ? JSON.parse(Array.isArray(homeData) ? homeData[0] : homeData) 
  : {};

  const handleNavigateToGetStarted4 = async () => {
    const updatedHomeData = {
      ...parsedHomeData,
      selectedHouseType: selectedHouseType === t('OTHERS') 
        ? (otherHouseType.trim() !== "" ? otherHouseType : null) 
        : (selectedHouseType.trim() !== "" ? selectedHouseType : null),

      selectedMaterial: selectedMaterial === t('OTHERS') 
        ? (otherMaterial.trim() !== "" ? otherMaterial : null) 
        : (selectedMaterial.trim() !== "" ? selectedMaterial : null),

      selectedFlooring: selectedFlooring === t('OTHERS') 
        ? (otherFlooring.trim() !== "" ? otherFlooring : null) 
        : (selectedFlooring.trim() !== "" ? selectedFlooring : null),

      selectedWall: selectedWall === t('OTHERS') 
        ? (otherWall.trim() !== "" ? otherWall : null) 
        : (selectedWall.trim() !== "" ? selectedWall : null),

      selectedCeiling: selectedCeiling === t('OTHERS') 
        ? (otherCeiling.trim() !== "" ? otherCeiling : null) 
        : (selectedCeiling.trim() !== "" ? selectedCeiling : null),
        
        latitude: location.latitude,
        longitude: location.longitude,
      homeowner_id: userId,
      is_default: true,
    };

    try {
      console.log(`sent: ${JSON.stringify(updatedHomeData)}`)
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
  
      console.log('Home created successfully');
  
      router.push('/(tabs)/Dashboard/board');
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create home. Try again later.',
        [{ text: 'OK', onPress: () => BackHandler.exitApp() }]
      );
    }
  };
  
  const currentStep = 4;

  return (
    <View style={styles.container}>
      <View style={styles.upperSection}>
        <Image source={require('../../../assets/images/houseGS3.png')} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.lowerSection}>
      {/* <View style={styles.progressBar}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressStep,
              index < currentStep ? styles.progressStepActive : styles.progressStepInactive,
            ]}
          />
        ))}
      </View> */}

      <Text style={styles.title1}>{t('TELL_US_YOUR_HOME')}</Text>
      <Text style={styles.subtitle1}>{t('BASIC_HOME_DETAILS')} {t('BASIC_HOME_DETAILS2')}</Text>

      {/* Scrollable form */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* House Type Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedHouseType} onValueChange={(itemValue) => setSelectedHouseType(itemValue)} style={styles.picker}>
            <Picker.Item label="Primary Material of the House" value="" enabled={false} />
            <Picker.Item label="Reinforced concrete" value="reinforced" />
            <Picker.Item label="Concrete hollow blocks" value="concrete" />
            <Picker.Item label="Wood" value="wood" />
            <Picker.Item label="Bamboo" value="bamboo" />
            <Picker.Item label="Mixed materials" value="others" />
          </Picker>
        </View>

        {selectedHouseType === t('OTHERS') && (
          <TextInput
            style={styles.textBox}
            placeholder={t('SPECIFY_OTHER_HOUSE_TYPE')}
            placeholderTextColor="#BBBBBB"
            value={otherHouseType}
            onChangeText={(text) => setOtherHouseType(text)}
          />
        )}

        {/* Roofing Material Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedMaterial} onValueChange={(itemValue) => setSelectedMaterial(itemValue)} style={styles.picker}>
            <Picker.Item label={t('PRIMARY_ROOFING_MATERIAL')} value="" enabled={false} />
            <Picker.Item label="GI sheets (yero)" value="yero" />
            <Picker.Item label="Clay tiles" value="clay" />
            <Picker.Item label="Concrete slab" value="slab" />
            <Picker.Item label="Nipa/ Bamboo" value="nipa" />
            <Picker.Item label="Asphalt shingles" value="asphalt" />
            <Picker.Item label={t('OTHERS')} value={t('OTHERS')} />
          </Picker>
        </View>

        {selectedMaterial === t('OTHERS') && (
          <TextInput
            style={styles.textBox}
            placeholder={t('SPECIFY_OTHER_ROOFING_MATERIAL')}
            placeholderTextColor="#BBBBBB"
            value={otherMaterial}
            onChangeText={(text) => setOtherMaterial(text)}
          />
        )}

        {/* Flooring Material Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedFlooring} onValueChange={(itemValue) => setSelectedFlooring(itemValue)} style={styles.picker}>
            <Picker.Item label={t('FLOORING_MATERIAL')} value="" enabled={false} />
            <Picker.Item label="Concrete" value="concrete" />
            <Picker.Item label="Wood" value="wood" />
            <Picker.Item label="Tiles" value="tiles" />
            <Picker.Item label="Vinyl" value="vinyl" />
            <Picker.Item label={t('OTHERS')} value={t('OTHERS')} />
          </Picker>
        </View>

        {selectedFlooring === t('OTHERS') && (
          <TextInput
            style={styles.textBox}
            placeholder={t('SPECIFY_OTHER_FLOORING_MATERIAL')}
            placeholderTextColor="#BBBBBB"
            value={otherFlooring}
            onChangeText={(text) => setOtherFlooring(text)}
          />
        )}

        {/* Wall Material Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedWall} onValueChange={(itemValue) => setSelectedWall(itemValue)} style={styles.picker}>
            <Picker.Item label={t('WALL_MATERIAL')} value="" enabled={false} />
            <Picker.Item label="Concrete" value="concrete" />
            <Picker.Item label="Wood" value="wood" />
            <Picker.Item label="Bamboo" value="bamboo" />
            <Picker.Item label={t('OTHERS')} value={t('OTHERS')} />
          </Picker>
        </View>

        {selectedWall === t('OTHERS') && (
          <TextInput
            style={styles.textBox}
            placeholder={t('SPECIFY_OTHER_WALL_MATERIAL')}
            placeholderTextColor="#BBBBBB"
            value={otherWall}
            onChangeText={(text) => setOtherWall(text)}
          />
        )}

        {/* Ceiling Material Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedCeiling} onValueChange={(itemValue) => setSelectedCeiling(itemValue)} style={styles.picker}>
            <Picker.Item label={t('CEILING_MATERIAL')} value="" enabled={false} />
            <Picker.Item label="Gypsum board" value="gypsum" />
            <Picker.Item label="Wood" value="wood" />
            <Picker.Item label="PVC" value="pvc" />
            <Picker.Item label={t('OTHERS')} value={t('OTHERS')} />
          </Picker>
        </View>

        {selectedCeiling === t('OTHERS') && (
          <TextInput
            style={styles.textBox}
            placeholder={('SPECIFY_OTHER_CEILING_MATERIAL')}
            placeholderTextColor="#BBBBBB"
            value={otherCeiling}
            onChangeText={(text) => setOtherCeiling(text)}
          />
        )}
      </ScrollView>

      
      <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted4}>
        <Text style={styles.buttonText}>{t('ADD_PROPERTY')}</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  upperSection: {
    flex: 1,
    backgroundColor: '#0B417D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowerSection: {
    flex: 1.05,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  image: {
    width: wp('100%'),
    height: hp('50%'),
  },
  // progressBar: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   width: wp('90%'),
  //   marginBottom: hp('1%'),
  //   marginTop: hp('1%'),
  // },
  // progressStep: {
  //   width: wp('13%'),
  //   height: hp('0.6%'),
  //   borderRadius: wp('2.5%'),
  // },
  // progressStepActive: {
  //   backgroundColor: '#0B417D',
  // },
  // progressStepInactive: {
  //   backgroundColor: '#E0E0E0',
  // },
  scrollView: {
    width: wp('100%'),
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  pickerContainer: {
    width: wp('70%'),
    height: hp('7%'),
    backgroundColor: '#D9D9D9',
    borderRadius: wp('6%'),
    marginBottom: hp('1.5%'),
  },
  picker: {
    width: wp('70%'),
    color: '#000',
  },
  textBox: {
    width: wp('60%'),
    padding: wp('2%'),
    borderRadius: wp('6%'),
    backgroundColor: '#D9D9D9',
    marginBottom: hp('1.5%'),
  },
  button: {
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('25%'),
    backgroundColor: '#08294E',
    padding: wp('3%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
    marginBottom: hp('2%'),
    // marginHorizontal: wp('18%'),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontFamily: 'Archivo-Bold',
  },
  title1: {
    fontSize: wp('6%'),
    color: '#05173F',
    textAlign: 'center',
    fontFamily: 'Epilogue-Black',
    letterSpacing: 1,
    marginBottom: hp('0.4%'),
  },
  subtitle1: {
    fontSize: wp('4%'),
    color: '#7C7C7C',
    textAlign: 'center',
    fontFamily: 'Archivo-Regular',
    marginBottom: hp('1.5%'),
    letterSpacing: 1,
  },
});

export default GettingStarted3b;