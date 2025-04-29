import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput,
  ScrollView, Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

const GettingStarted3 = () => {
  const router = useRouter();
  const [age, setAge] = useState('');
  const [heightVal, setHeightVal] = useState('');
  const [lotArea, setLotArea] = useState('');
  const [floorArea, setFloorArea] = useState('');
  const [selectedHouseType, setSelectedHouseType] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [otherMaterial, setOtherMaterial] = useState('');
  const [otherHouseType, setOtherHouseType] = useState('');
  const styles = getStyles(width, height);
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const currentStep = 3;

  return (
    <View style={styles.container}>
      <View style={styles.upperSection}>
        <Image
          source={require('../assets/images/houseGS3.png')}
          style={styles.image}
          resizeMode="contain"
        />
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

        {/* <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        > */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedHouseType}
              onValueChange={(itemValue) => setSelectedHouseType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Type of House" value="" enabled={false} />
              <Picker.Item label="Single-detached" value="single" />
              <Picker.Item label="Townhouse" value="town" />
              <Picker.Item label="Apartment" value="apartment" />
              <Picker.Item label="Stilt house" value="stilt" />
              <Picker.Item label="Duplex" value="duplex" />
              <Picker.Item label="Others" value="others" />
            </Picker>
          </View>

          {selectedHouseType === 'others' && (
            <TextInput
              style={styles.textBox1}
              placeholder="Specify other house type"
              placeholderTextColor="#BBBBBB"
              value={otherHouseType}
              onChangeText={setOtherHouseType}
            />
          )}

          <View style={styles.inputRow}>
            <Text style={styles.label}>Enter the Height of the House</Text>
            <TextInput
              style={styles.textBox}
              placeholder="(1, 2, 3, etc.)"
              placeholderTextColor="#BBBBBB"
              keyboardType="numeric"
              value={heightVal}
              onChangeText={setHeightVal}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>What is the estimated lot area?</Text>
            <TextInput
              style={styles.textBox}
              placeholder="sqm"
              placeholderTextColor="#BBBBBB"
              keyboardType="numeric"
              value={lotArea}
              onChangeText={setLotArea}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>What is the estimated floor area?</Text>
            <TextInput
              style={styles.textBox}
              placeholder="sqm"
              placeholderTextColor="#BBBBBB"
              keyboardType="numeric"
              value={floorArea}
              onChangeText={setFloorArea}
            />
          </View>
        {/* </ScrollView> */}

        <TouchableOpacity style={styles.button} onPress={() => router.push('/getstarted_3b')}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (width: number, height: number) => StyleSheet.create({
  container: { flex: 1 },
  upperSection: {
    flex: 1,
    backgroundColor: '#0B417D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 1,
    height: height * 1,
  },
  lowerSection: {
    flex: 1.05,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  progressStep: {
    flex: 1,
    height: 5,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  progressStepActive: {
    backgroundColor: '#0B417D',
  },
  progressStepInactive: {
    backgroundColor: '#E0E0E0',
  },
  title1: {
    fontSize: 23,
    color: '#05173F',
    textAlign: 'center',
    fontFamily: 'Epilogue-Black',
    marginBottom: 4,
    marginTop: -8,
  },
  subtitle1: {
    fontSize: 15,
    color: '#7C7C7C',
    textAlign: 'center',
    fontFamily: 'Archivo-Regular',
    marginBottom: 12,
  },
  pickerContainer: {
    width: '80%',
    backgroundColor: '#D9D9D9',
    borderRadius: 25,
    marginBottom: 15,
  },
  picker: {
    height: 55,
    color: '#05173F',
    paddingLeft: 12,
  },
  textBox1: {
    width: '80%',
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#D9D9D9',
    marginBottom: 10,
    // fontSize: width * 0.035,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '85%',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#05173F',
    fontFamily: 'Archivo-Regular',
    flex: 1,
    marginRight: 10,
  },
  textBox: {
    width: '40%',
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#D9D9D9',
    fontFamily: 'Archivo-Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    width: '70%',
    paddingVertical: height * 0.018,
    backgroundColor: '#08294E',
    borderRadius: 30,
    alignItems: 'center',
    marginTop: height * 0.01,
    // marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
  scrollView: {
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 50,
  },
});

export default GettingStarted3;
