import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTranslation } from '../../../hooks/useTranslation';

const GettingStarted3 = () => {
  const { t } = useTranslation();
  const { homeData } = useLocalSearchParams();
  console.log(homeData)
  const router = useRouter();
  const [age, setAge] = useState(''); // Separate state for Age
  const [numFloor, setNumFloor] = useState(''); // Separate state for Height
  const [lotArea, setLotArea] = useState(''); // Separate state for lot area
  const [floorArea, setFloorArea] = useState(''); // Separate state for floor area
  const [selectedHouseType, setSelectedHouseType] = useState(""); // Separate state for house type
  const [selectedMaterial, setSelectedMaterial] = useState(""); // Separate state for material
  const [otherMaterial, setOtherMaterial] = useState(''); // Separate state for other material
  const [otherHouseType, setOtherHouseType] = useState(''); // Separate state for other house type

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../../../assets/fonts/Archivo-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const parsedHomeData = homeData 
  ? JSON.parse(Array.isArray(homeData) ? homeData[0] : homeData) 
  : {};

  const handleNavigateToGetStarted3b = () => {
    if (numFloor.trim() !== "" && (!/^\d+$/.test(numFloor) || parseInt(numFloor) <= 0)) {
      alert(t('ERROR_HOUSE_FLOOR'));
      return;
    }
  
    if (lotArea.trim() !== "" && (isNaN(parseFloat(lotArea)) || parseFloat(lotArea) <= 0)) {
      alert(t('ERROR_LOT_AREA'));
      return;
    }
  
    if (floorArea.trim() !== "" && (isNaN(parseFloat(floorArea)) || parseFloat(floorArea) <= 0)) {
      alert(t('ERROR_FLOOR_AREA'));
      return;
    }
  
    const updatedHomeData = {
      ...parsedHomeData,
      typeOfHouse: selectedHouseType === t('OTHERS') 
    ? (otherHouseType.trim() !== "" ? otherHouseType : null) 
    : (selectedHouseType.trim() !== "" ? selectedHouseType : null),
      numFloor: numFloor.trim() !== "" ? parseInt(numFloor) : null,
      lotArea: lotArea.trim() !== "" ? parseFloat(lotArea) : null,
      floorArea: floorArea.trim() !== "" ? parseFloat(floorArea) : null,
    };
  
    router.push({
      pathname: './addproperty_3b',
      params: { homeData: JSON.stringify(updatedHomeData) },
    });
  };
  
  const currentStep = 3;

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
                index < currentStep ? styles.progressStepActive : styles.progressStepInactive 
              ]}
            />
          ))}
        </View> */}

        <Text style={styles.title1}>{t('TELL_US_YOUR_HOME')}</Text>
                <Text style={styles.subtitle1}>{t('BASIC_HOME_DETAILS')} {t('BASIC_HOME_DETAILS2')}</Text>
        {/* Scrollable form */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedHouseType} onValueChange={(itemValue) => setSelectedHouseType(itemValue)} style={styles.picker}>
            <Picker.Item label="Type of House" value="" enabled={false} />
            <Picker.Item label="Single-detached" value="single" />
            <Picker.Item label="Townhouse" value="town" />
            <Picker.Item label="Apartment" value="apartment" />
            <Picker.Item label="Stilt house" value="stilt" />
            <Picker.Item label="Duplex" value="duplex" />
            <Picker.Item label={t('OTHERS')} value={t('OTHERS')} />
          </Picker>
        </View>

        {selectedHouseType === t('OTHERS') && (
          <TextInput
            style={styles.textBox1}
            placeholder={t('SPECIFY_HOUSE_TYPE')}
            placeholderTextColor="#BBBBBB"
            value={otherHouseType}
            onChangeText={(text) => setOtherHouseType(text)}
          />
        )}

        <View style={styles.inputRow}>
          <Text style={styles.label}>{t('NUMBER_HOUSE_FLOORS')}</Text>
          <TextInput 
            style={styles.textBox} 
            placeholder="(1, 2, 3, etc.)" 
            placeholderTextColor="#BBBBBB" 
            value={numFloor} 
            onChangeText={(text) => setNumFloor(text)} 
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.label}>{t('ESTIMATED_LOT_AREA')}</Text>
          <TextInput 
            style={styles.textBox} 
            placeholder="sqm" 
            placeholderTextColor="#BBBBBB" 
            value={lotArea} 
            onChangeText={(text) => setLotArea(text)} 
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.label}>{t('ESTIMATED_FLOOR_AREA')}</Text>
          <TextInput 
            style={styles.textBox} 
            placeholder="sqm" 
            placeholderTextColor="#BBBBBB" 
            value={floorArea} 
            onChangeText={(text) => setFloorArea(text)} 
          />
        </View>

        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted3b}>
          <Text style={styles.buttonText}>{t('NEXT')}</Text>
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
    letterSpacing: wp('0.25%'),
    marginBottom: hp('0.4%'),
    // marginTop: hp('-1.5%'),
  },

  subtitle1: {
    fontSize: wp('4%'),
    color: '#7C7C7C',
    textAlign: 'center',
    fontFamily: 'Archivo-Regular',
    letterSpacing: wp('0.25%'),
    marginBottom: hp('1.2%'),
  },

  // progressBar: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   width: wp('90%'),
  //   // marginBottom: hp('2%'),
  //   marginTop: -hp('2.5%'),
  // },

  // progressStep: {
  //   width: wp('25%'),
  //   height: hp('0.6%'),
  //   borderRadius: wp('3%'),
  // },

  // progressStepActive: {
  //   backgroundColor: '#0B417D',
  // },

  // progressStepInactive: {
  //   backgroundColor: '#E0E0E0',
  // },

  textBox1: {
    width: wp('80%'),
    padding: wp('3%'),
    borderRadius: wp('10%'),
    backgroundColor: '#D9D9D9',
    marginBottom: hp('1.2%'),
  },

  textBox: {
    width: wp('30%'),
    padding: wp('3%'),
    borderRadius: wp('10%'),
    fontFamily: 'Archivo-Regular',
    fontSize: wp('3.5%'),
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#D9D9D9',
    marginLeft: wp('2.5%'),
  },

  pickerContainer: {
    width: wp('80%'),
    backgroundColor: '#D9D9D9',
    borderRadius: wp('10%'),
    marginBottom: hp('1.8%'),
  },

  picker: {
    height: hp('7%'),
    fontSize: wp('3%'),
    color: '#05173F',
    textAlign: 'center',
    textAlignVertical: 'top',
  },

  button: {
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('25%'),
    backgroundColor: '#08294E',
    padding: wp('2.5%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
    marginBottom: hp('2.5%'),
  },

  buttonText: {
    fontSize: wp('4.5%'),
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: wp('80%'),
    marginBottom: hp('1.2%'),
    marginLeft: wp('-11%'),
    paddingHorizontal: wp('3%'),
  },

  label: {
    fontSize: wp('3.7%'),
    color: '#05173F',
    fontFamily: 'Archivo-Regular',
    textAlign: 'auto',
  },
  scrollView: { width: '100%', height:'100%' },
  scrollContainer: { flexGrow: 1, alignItems: 'center', paddingBottom: 50 },

  // scrollView: {
  //   width: wp('100%'),
  // },

  // scrollContainer: {
  //   flexGrow: 1,
  //   alignItems: 'center',
  //   paddingBottom: hp('6%'),
  //   backgroundColor: '#000',
  //   paddingHorizontal: wp('5%'),
  // },
});

export default GettingStarted3;