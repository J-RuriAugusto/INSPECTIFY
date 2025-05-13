import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const GettingStarted3b = () => {
  const { homeData } = useLocalSearchParams();
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

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const parsedHomeData = homeData 
  ? JSON.parse(Array.isArray(homeData) ? homeData[0] : homeData) 
  : {};

  const handleNavigateToGetStarted4 = () => {
    const updatedHomeData = {
      ...parsedHomeData,
      selectedHouseType: selectedHouseType === "others" 
        ? (otherHouseType.trim() !== "" ? otherHouseType : null) 
        : (selectedHouseType.trim() !== "" ? selectedHouseType : null),

      selectedMaterial: selectedMaterial === "others" 
        ? (otherMaterial.trim() !== "" ? otherMaterial : null) 
        : (selectedMaterial.trim() !== "" ? selectedMaterial : null),

      selectedFlooring: selectedFlooring === "others" 
        ? (otherFlooring.trim() !== "" ? otherFlooring : null) 
        : (selectedFlooring.trim() !== "" ? selectedFlooring : null),

      selectedWall: selectedWall === "others" 
        ? (otherWall.trim() !== "" ? otherWall : null) 
        : (selectedWall.trim() !== "" ? selectedWall : null),

      selectedCeiling: selectedCeiling === "others" 
        ? (otherCeiling.trim() !== "" ? otherCeiling : null) 
        : (selectedCeiling.trim() !== "" ? selectedCeiling : null),
        };
  
    router.push({
      pathname: '/getstarted_4',
      params: { homeData: JSON.stringify(updatedHomeData) },
    });
  };
  
  const currentStep = 4;

  return (
    <View style={styles.container}>
      <View style={styles.upperSection}>
        <Image source={require('../assets/images/houseGS3.png')} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.lowerSection}>
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

      <Text style={styles.title1}>Tell Us About Your Home</Text>
      <Text style={styles.subtitle1}>Enter basic details about your home to begin.</Text>

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

        {selectedHouseType === "others" && (
          <TextInput
            style={styles.textBox}
            placeholder="Specify other house type"
            placeholderTextColor="#BBBBBB"
            value={otherHouseType}
            onChangeText={(text) => setOtherHouseType(text)}
          />
        )}

        {/* Roofing Material Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedMaterial} onValueChange={(itemValue) => setSelectedMaterial(itemValue)} style={styles.picker}>
            <Picker.Item label="Primary Roofing Material" value="" enabled={false} />
            <Picker.Item label="GI sheets (yero)" value="yero" />
            <Picker.Item label="Clay tiles" value="clay" />
            <Picker.Item label="Concrete slab" value="slab" />
            <Picker.Item label="Nipa/ Bamboo" value="nipa" />
            <Picker.Item label="Asphalt shingles" value="asphalt" />
            <Picker.Item label="Others" value="others" />
          </Picker>
        </View>

        {selectedMaterial === "others" && (
          <TextInput
            style={styles.textBox}
            placeholder="Specify other roofing material"
            placeholderTextColor="#BBBBBB"
            value={otherMaterial}
            onChangeText={(text) => setOtherMaterial(text)}
          />
        )}

        {/* Flooring Material Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedFlooring} onValueChange={(itemValue) => setSelectedFlooring(itemValue)} style={styles.picker}>
            <Picker.Item label="Flooring Materials" value="" enabled={false} />
            <Picker.Item label="Concrete" value="concrete" />
            <Picker.Item label="Wood" value="wood" />
            <Picker.Item label="Tiles" value="tiles" />
            <Picker.Item label="Vinyl" value="vinyl" />
            <Picker.Item label="Others" value="others" />
          </Picker>
        </View>

        {selectedFlooring === "others" && (
          <TextInput
            style={styles.textBox}
            placeholder="Specify other flooring material"
            placeholderTextColor="#BBBBBB"
            value={otherFlooring}
            onChangeText={(text) => setOtherFlooring(text)}
          />
        )}

        {/* Wall Material Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedWall} onValueChange={(itemValue) => setSelectedWall(itemValue)} style={styles.picker}>
            <Picker.Item label="Wall Material" value="" enabled={false} />
            <Picker.Item label="Concrete" value="concrete" />
            <Picker.Item label="Wood" value="wood" />
            <Picker.Item label="Bamboo" value="bamboo" />
            <Picker.Item label="Others" value="others" />
          </Picker>
        </View>

        {selectedWall === "others" && (
          <TextInput
            style={styles.textBox}
            placeholder="Specify other wall material"
            placeholderTextColor="#BBBBBB"
            value={otherWall}
            onChangeText={(text) => setOtherWall(text)}
          />
        )}

        {/* Ceiling Material Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedCeiling} onValueChange={(itemValue) => setSelectedCeiling(itemValue)} style={styles.picker}>
            <Picker.Item label="Ceiling Material" value="" enabled={false} />
            <Picker.Item label="Gypsum board" value="gypsum" />
            <Picker.Item label="Wood" value="wood" />
            <Picker.Item label="PVC" value="pvc" />
            <Picker.Item label="Others" value="others" />
          </Picker>
        </View>

        {selectedCeiling === "others" && (
          <TextInput
            style={styles.textBox}
            placeholder="Specify other ceiling material"
            placeholderTextColor="#BBBBBB"
            value={otherCeiling}
            onChangeText={(text) => setOtherCeiling(text)}
          />
        )}
      </ScrollView>

      {/* Next Button */}
      <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted4}>
        <Text style={styles.buttonText}>Next</Text>
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
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp('90%'),
    marginBottom: hp('1%'),
    marginTop: hp('1%'),
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
    marginBottom: hp('3%'),
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