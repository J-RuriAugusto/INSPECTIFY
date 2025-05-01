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

const GettingStarted = () => {
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

  const API_KEY = 'BT_1smAfCA4roEldR7S9LObSgdbZ7uGAF2HJvs5VQyY';

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
  
      router.push('./dashboard');
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

      
      <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted4}>
        <Text style={styles.buttonText}>Add Property</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  upperSection: { flex: 1, backgroundColor: '#0B417D', justifyContent: 'center', alignItems: 'center' },
  lowerSection: {
    flex: 1.05,
    backgroundColor: '#FFFFFF', // White background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: { width: '100%', height: 400 },
  progressBar: { flexDirection: 'row', justifyContent: 'space-between', width:'100%', marginBottom: 8 },
  progressStep: { width: 50, height: 5, borderRadius: 10 },
  progressStepActive: { backgroundColor: '#0B417D' },
  progressStepInactive: { backgroundColor: '#E0E0E0' },
  scrollView: { width: '100%' },
  scrollContainer: { flexGrow: 1, alignItems: 'center', paddingBottom: 50 },
  pickerContainer: { width: '80%', backgroundColor: '#D9D9D9', borderRadius: 25, marginBottom: 15 },
  textBox: { width: '80%', padding: 10, borderRadius: 25, backgroundColor: '#D9D9D9', marginBottom: 10 },
  button: {width:'70%', height: '15%', backgroundColor: '#08294E', padding: 10, borderRadius: 30, alignItems: 'center', marginBottom: 10, marginHorizontal: 75 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Archivo-Bold' },
  title1: { fontSize: 23, color: '#05173F', textAlign: 'center', fontFamily: 'Epilogue-Black', letterSpacing: 1 },
  subtitle1: { fontSize: 15, color: '#7C7C7C', textAlign: 'center', fontFamily: 'Archivo-Regular', marginBottom: 10, letterSpacing: 1 },
  
});

export default GettingStarted;
