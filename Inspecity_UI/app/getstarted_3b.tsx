import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

const GettingStarted = () => {
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

  const handleNavigateToGetStarted4 = () => {
    router.push('/getstarted_4');
  };
  const currentStep = 4;

  return (
    <View style={styles.container}>
      <View style={styles.upperSection}>
        <Image source={require('../assets/images/houseGS3.png')} style={styles.image} resizeMode="contain" />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer}>
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

        <View style={styles.scrollableForm}>
          {/* House Type Dropdown */}
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedHouseType} onValueChange={(itemValue) => setSelectedHouseType(itemValue)} style={styles.picker}>
              <Picker.Item label="Primary Material of the House" value="" enabled={false} />
              <Picker.Item label="Reinforced concrete" value="reinforced" />
              <Picker.Item label="Concrete hollow blocks" value="concrete" />
              <Picker.Item label="Wood" value="wood" />
              <Picker.Item label="Bamboo" value="Bamboo" />
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
              value={otherMaterial}
              onChangeText={(text) => setOtherFlooring(text)}
            />
          )}

          {/* Additional Dropdowns for Wall and Ceiling */}
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
              value={otherMaterial}
              onChangeText={(text) => setOtherWall(text)}
            />
          )}

          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedCeiling} onValueChange={(itemValue) => setSelectedCeiling(itemValue)} style={styles.picker}>
              <Picker.Item label="Ceiling Material" value="" enabled={false} />
              <Picker.Item label="Gypsum board" value="gypsum" />
              <Picker.Item label="Wood" value="wood" />
              <Picker.Item label="PVC" value="pvc" />
              <Picker.Item label="Others" value="others" />
            </Picker>
          </View>
        </View>

        {selectedCeiling === "others" && (
            <TextInput
              style={styles.textBox}
              placeholder="Specify other ceiling material"
              placeholderTextColor="#BBBBBB"
              value={otherMaterial}
              onChangeText={(text) => setOtherCeiling(text)}
            />
          )}

        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted4}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  upperSection: { flex: 1, backgroundColor: '#0B417D', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 400 },
  scrollView: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#FFFFFF'},
  scrollableForm: { alignItems: 'center',maxHeight: 'auto', width: '100%', overflow: 'scroll', backgroundColor: '#FFFFFF' },
  progressBar: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginBottom: 20 },
  progressStep: { width: 50, height: 5, borderRadius: 10 },
  picker: { height: 50, fontSize: 10, color: '#05173F', textAlign: 'center' },
  progressStepActive: { backgroundColor: '#0B417D' },
  progressStepInactive: { backgroundColor: '#E0E0E0' },
  title1: { fontSize: 23, color: '#05173F', textAlign: 'center', fontFamily: 'Epilogue-Black', letterSpacing: 1 },
  subtitle1: { fontSize: 15, color: '#7C7C7C', textAlign: 'center', fontFamily: 'Archivo-Regular', marginBottom: 10 },
  pickerContainer: { width: '80%', backgroundColor: '#D9D9D9', borderRadius: 25, borderWidth: 2, borderColor: '#A0A0A0', overflow: 'hidden', marginBottom: 10 },
  picker: { height: 50, fontSize: 10, color: '#05173F', textAlign: 'center' },
  textBox: { width: '70%', height: 40, borderColor: '#A0A0A0', borderWidth: 2, borderRadius: 25, paddingHorizontal: 20, fontFamily: 'Archivo-Regular', fontSize: 13, color: '#05173F', backgroundColor: '#D9D9D9', marginBottom: 10 },
  button: { backgroundColor: '#08294E', paddingVertical: 10, paddingHorizontal: 90, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 18, color: '#FFFFFF', fontFamily: 'Archivo-Bold' }
});

export default GettingStarted;