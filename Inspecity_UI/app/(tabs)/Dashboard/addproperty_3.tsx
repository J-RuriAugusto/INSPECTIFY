import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ScrollView, 
  Modal,  
  Keyboard, 
  Platform,
  KeyboardAvoidingView,
  Pressable
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from '../../../hooks/useTranslation';

const GettingStarted3 = () => {
  const { t } = useTranslation();
  const { homeData } = useLocalSearchParams();
  const router = useRouter();
  const [numFloor, setNumFloor] = useState('');
  const [lotArea, setLotArea] = useState('');
  const [floorArea, setFloorArea] = useState('');
  const [selectedHouseType, setSelectedHouseType] = useState("");
  const [otherHouseType, setOtherHouseType] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [activeInput, setActiveInput] = useState<Field | null>(null);
  const [inputValue, setInputValue] = useState('');
  const textInputRef = useRef<TextInput>(null);

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Bold': require('../../../assets/fonts/Archivo-Bold.ttf'),
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (activeInput) {
      // Small timeout to ensure modal is fully rendered before focusing
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 100);
    }
  }, [activeInput]);

  if (!fontsLoaded) {
    return null;
  }

  const parsedHomeData = homeData 
    ? JSON.parse(Array.isArray(homeData) ? homeData[0] : homeData) 
    : {};

  type Field = 'numFloor' | 'lotArea' | 'floorArea' | 'otherHouseType';

  const handleInputPress = (field: Field) => {
    setActiveInput(field);
    switch(field) {
      case 'numFloor': 
        setInputValue(numFloor); 
        break;
      case 'lotArea': 
        setInputValue(lotArea); 
        break;
      case 'floorArea': 
        setInputValue(floorArea); 
        break;
      case 'otherHouseType': 
        setInputValue(otherHouseType); 
        break;
    }
  };

  const handleModalSubmit = () => {
    switch(activeInput) {
      case 'numFloor':
        setNumFloor(inputValue);
        break;
      case 'lotArea':
        setLotArea(inputValue);
        break;
      case 'floorArea':
        setFloorArea(inputValue);
        break;
      case 'otherHouseType':
        setOtherHouseType(inputValue);
        break;
    }
    setActiveInput(null);
    setInputValue('');
    Keyboard.dismiss();
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.upperSection}>
        <Image source={require('../../../assets/images/houseGS3.png')} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.lowerSection}>
        <Text style={styles.title1}>Tell Us About Your Home</Text>
        <Text style={styles.subtitle1}>Enter basic details about your home to begin.</Text>
        
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
        >
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
            <TouchableOpacity 
              style={styles.textBox1} 
              onPress={() => handleInputPress('otherHouseType')}
            >
              <Text style={otherHouseType ? styles.inputText : styles.placeholderText}>
                {otherHouseType || "Specify other house type"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.inputRow}>
            <Text style={styles.label}>{t('NUMBER_HOUSE_FLOORS')}</Text>
            <TouchableOpacity 
              style={styles.textBox} 
              onPress={() => handleInputPress('numFloor')}
            >
              <Text style={numFloor ? styles.inputText : styles.placeholderText}>
                {numFloor || "(1, 2, 3, etc.)"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>{t('ESTIMATED_LOT_AREA')}</Text>
            <TouchableOpacity 
              style={styles.textBox} 
              onPress={() => handleInputPress('lotArea')}
            >
              <Text style={lotArea ? styles.inputText : styles.placeholderText}>
                {lotArea || "sqm"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>{t('ESTIMATED_FLOOR_AREA')}</Text>
            <TouchableOpacity 
              style={styles.textBox} 
              onPress={() => handleInputPress('floorArea')}
            >
              <Text style={floorArea ? styles.inputText : styles.placeholderText}>
                {floorArea || "sqm"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted3b}>
          <Text style={styles.buttonText}>{t('NEXT')}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for input */}
      <Modal
        visible={!!activeInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setActiveInput(null);
          Keyboard.dismiss();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? -hp('15%') : 0}
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => {
              setActiveInput(null);
              Keyboard.dismiss();
            }}
          >
            <View style={[styles.modalContent, isKeyboardVisible && styles.modalContentKeyboardOpen]}>
              <View style={styles.modalinputRow}>
                <TextInput
                  ref={textInputRef}
                  style={styles.modalInput}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={
                    activeInput === 'numFloor' ? 'Enter number of floors' :
                    activeInput === 'lotArea' ? 'Enter lot area' :
                    activeInput === 'floorArea' ? 'Enter floor area' :
                    'Specify other house type'
                  }
                  placeholderTextColor="#BBBBBB"
                  keyboardType={
                    activeInput === 'numFloor' || 
                    activeInput === 'lotArea' || 
                    activeInput === 'floorArea' ? 'numeric' : 'default'
                  }
                />
                <Pressable
                  style={styles.submitIconButton}
                  onPress={handleModalSubmit}
                >
                  <MaterialIcons name="check-circle" size={wp('10%')} color="#0B417D" />
                </Pressable>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
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
  },
  subtitle1: {
    fontSize: wp('4%'),
    color: '#7C7C7C',
    textAlign: 'center',
    fontFamily: 'Archivo-Regular',
    letterSpacing: wp('0.25%'),
    marginBottom: hp('1.2%'),
  },
  textBox1: {
    width: wp('80%'),
    padding: wp('3%'),
    borderRadius: wp('10%'),
    backgroundColor: '#D9D9D9',
    marginBottom: hp('1.2%'),
    justifyContent: 'center',
    height: hp('6%'),
  },
  textBox: {
    width: wp('30%'),
    padding: wp('3%'),
    borderRadius: wp('10%'),
    backgroundColor: '#D9D9D9',
    marginLeft: wp('2.5%'),
    justifyContent: 'center',
    height: hp('5%'),
  },
  inputText: {
    fontFamily: 'Archivo-Regular',
    fontSize: wp('3.5%'),
    color: '#05173F',
    textAlign: 'center',
  },
  placeholderText: {
    fontFamily: 'Archivo-Regular',
    fontSize: wp('3.5%'),
    color: '#BBBBBB',
    textAlign: 'center',
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
  scrollView: { width: '100%', height: '100%' },
  scrollContainer: { flexGrow: 1, alignItems: 'center', paddingBottom: 50 },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
   modalContent: {
    marginHorizontal: wp('5%'),
    borderRadius: wp('5%'),
    padding: wp('5%'),
    backgroundColor: 'transparent',
  },
  modalContentKeyboardOpen: {
    marginBottom: hp('-20%'), // Adjust this value based on your needs
  },
    modalinputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: wp('10%'),
    paddingRight: wp('2%'),
  },
  modalInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: wp('10%'),
    padding: wp('4%'),
    fontSize: wp('4%'),
    fontFamily: 'Archivo-Regular',
    backgroundColor: 'white',
  },
  submitIconButton: {
    padding: wp('2%'),
  },
});

export default GettingStarted3;