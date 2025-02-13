import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

const GettingStarted = () => {
  const router = useRouter();
  const [age, setAge] = useState(''); // Separate state for Age
  const [height, setHeight] = useState(''); // Separate state for Height
  const [lotArea, setLotArea] = useState(''); // Separate state for lot area
  const [floorArea, setFloorArea] = useState(''); // Separate state for floor area
  const [selectedHouseType, setSelectedHouseType] = useState(""); // Separate state for house type
  const [selectedMaterial, setSelectedMaterial] = useState(""); // Separate state for material
  const [otherMaterial, setOtherMaterial] = useState(''); // Separate state for other material
  const [otherHouseType, setOtherHouseType] = useState(''); // Separate state for other house type

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleNavigateToGetStarted3b = () => {
    router.push('/getstarted_3b');
  };

  const currentStep = 3;

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
                index < currentStep ? styles.progressStepActive : styles.progressStepInactive 
              ]}
            />
          ))}
        </View>

        <Text style={styles.title1}>Tell Us About Your Home</Text>
        <Text style={styles.subtitle1}>Enter basic details about your home to begin.</Text>

        <View style={styles.pickerContainer}>
          <Picker selectedValue={selectedHouseType} onValueChange={(itemValue) => setSelectedHouseType(itemValue)} style={styles.picker}>
            <Picker.Item label="Type of House" value="" enabled={false} />
            <Picker.Item label="Single-detached" value="single" />
            <Picker.Item label="Townhouse" value="town" />
            <Picker.Item label="Apartment" value="apartment" />
            <Picker.Item label="Stilt house" value="stilt" />
            <Picker.Item label="Duplex" value="duplex" />
            <Picker.Item label="Others" value="others" />
          </Picker>
        </View>

        {selectedHouseType === "others" && (
          <TextInput
            style={styles.textBox1}
            placeholder="Specify other house type"
            placeholderTextColor="#BBBBBB"
            value={otherHouseType}
            onChangeText={(text) => setOtherHouseType(text)}
          />
        )}

        <View style={styles.inputRow}>
          <Text style={styles.label}>Enter the Height of the House</Text>
          <TextInput 
            style={styles.textBox} 
            placeholder="(1, 2, 3, etc.)" 
            placeholderTextColor="#BBBBBB" 
            value={height} 
            onChangeText={(text) => setHeight(text)} 
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.label}>What is the estimated lot area?</Text>
          <TextInput 
            style={styles.textBox} 
            placeholder="sqm" 
            placeholderTextColor="#BBBBBB" 
            value={lotArea} 
            onChangeText={(text) => setLotArea(text)} 
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.label}>What is the estimated floor area?</Text>
          <TextInput 
            style={styles.textBox} 
            placeholder="sqm" 
            placeholderTextColor="#BBBBBB" 
            value={floorArea} 
            onChangeText={(text) => setFloorArea(text)} 
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted3b}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  upperSection: { flex: 1, backgroundColor: '#0B417D', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 400 },
  lowerSection: { flex: 1.05, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title1: { fontSize: 23, color: '#05173F', textAlign: 'center', fontFamily: 'Epilogue-Black', letterSpacing: 1, marginBottom: 3, marginTop: -12 },
  subtitle1: { fontSize: 15, color: '#7C7C7C', textAlign: 'center', fontFamily: 'Archivo-Regular', letterSpacing: 1, marginBottom: 10 },
  progressBar: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  progressStep: { width: 50, height: 5, borderRadius: 10 },
  progressStepActive: { backgroundColor: '#0B417D' },
  progressStepInactive: { backgroundColor: '#E0E0E0' },
  textBox1: { width: '70%', height: 40, borderColor: '#A0A0A0', borderWidth: 2, borderRadius: 25, paddingHorizontal: 10, fontFamily: 'Archivo-Regular', fontSize: 13, color: '#05173F', textAlign: 'center', backgroundColor: '#D9D9D9', marginLeft:10, marginBottom:5 },
  textBox: { width: '30%', height: 40, borderColor: '#A0A0A0', borderWidth: 2, borderRadius: 25, paddingHorizontal: 10, fontFamily: 'Archivo-Regular', fontSize: 13, color: '#05173F', textAlign: 'center', backgroundColor: '#D9D9D9', marginLeft:10 },
  pickerContainer: { width: '60%', backgroundColor: '#D9D9D9', borderRadius: 25, borderWidth: 2, borderColor: '#A0A0A0', overflow: 'hidden', marginBottom: 10, height: 50 },
  picker: { height: 50, fontSize: 12, color: '#05173F' },
  button: { backgroundColor: '#08294E', paddingVertical: 10, paddingHorizontal: 90, borderRadius: 30, alignItems: 'center' },
  buttonText: { fontSize: 18, color: '#FFFFFF', fontFamily: 'Archivo-Bold' },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '80%', marginBottom: 10, marginLeft: -20 },
  label: { fontSize: 14, color: '#05173F', fontFamily: 'Archivo-Regular', textAlign: 'auto' }
});

export default GettingStarted;