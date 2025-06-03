import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Alert, 
  Modal, 
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const GettingStarted2 = () => {
  const router = useRouter();
  const [homeName, setHomeName] = useState('');
  const [houseAge, setHouseAge] = useState('');
  const [houseUse, setHouseUse] = useState('');
  const [renovations, setRenovations] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [activeInput, setActiveInput] = useState<Field | null>(null);
  const textInputRef = useRef<TextInput>(null);

  // const [fontsLoaded] = useFonts({
  //   'Epilogue-Black': require('../assets/fonts/Epilogue-Black.ttf'),
  //   'Archivo-Regular': require('../assets/fonts/Archivo-Regular.ttf'),
  //   'Archivo-Bold': require('../assets/fonts/Archivo-Bold.ttf'),
  // });

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

  // if (!fontsLoaded) {
  //   return null;
  // }

  type Field = 'homeName' | 'houseAge' | 'houseUse' | 'renovations';

  const handleInputPress = (field: Field) => {
    setActiveInput(field);
    switch (field) {
      case 'homeName':
        setInputValue(homeName);
        break;
      case 'houseAge':
        setInputValue(houseAge);
        break;
      case 'houseUse':
        setInputValue(houseUse);
        break;
      case 'renovations':
        setInputValue(renovations);
        break;
    }
  };

  const handleModalSubmit = () => {
    // Update the correct value based on which input is active
    switch (activeInput) {
      case 'homeName':
        setHomeName(inputValue);
        break;
      case 'houseAge':
        setHouseAge(inputValue);
        break;
      case 'houseUse':
        setHouseUse(inputValue);
        break;
      case 'renovations':
        setRenovations(inputValue);
        break;
    }

    // Close modal and keyboard simultaneously in the same frame
    requestAnimationFrame(() => {
      setActiveInput(null);    // Dismiss the modal
      Keyboard.dismiss();      // Dismiss the keyboard
    });
  };




  const handleNavigateToGetStarted3 = () => {
    if (!homeName.trim()) {
      Alert.alert('Error', 'Home name is required.');
      return;
    }
  
    if (!houseAge.trim()) {
      Alert.alert('Error', 'House age is required.');
      return;
    }
  
    const age = parseInt(houseAge, 10);
  
    if (isNaN(age) || age <= 0) {
      Alert.alert('Error', 'Please enter a valid positive integer for the house age.');
      return;
    }
  
    const homeData = JSON.stringify({ 
      homeName, 
      houseAge: age,
      houseUse: houseUse.trim() || null, 
      renovations: renovations.trim() || null
    });
  
    router.push({
      pathname: './getstarted_3',
      params: { homeData },
    });
  };

  const currentStep = 2;

  return (
<View style={styles.container}>
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

        <Text style={styles.title1}>Add Your Home</Text>
        <Text style={styles.subtitle1}>Enter basic details about your</Text>
        <Text style={styles.subtitle2}>home to begin.</Text>

        {/* Wrap just the form elements in ScrollView */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          style={styles.textBox} 
          onPress={() => handleInputPress('homeName')}
        >
          <Text style={homeName ? styles.inputText : styles.placeholderText}>
            {homeName || 'Enter your home name'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.textBox} 
          onPress={() => handleInputPress('houseAge')}
        >
          <Text style={houseAge ? styles.inputText : styles.placeholderText}>
            {houseAge || 'Enter the age of the house'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.textBox} 
          onPress={() => handleInputPress('houseUse')}
        >
          <Text style={houseUse ? styles.inputText : styles.placeholderText}>
            {houseUse || 'Enter the primary use of the House'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Has the house undergone</Text>
        <Text style={styles.label}>renovations or repairs?</Text>

        <TouchableOpacity 
          style={styles.textBox} 
          onPress={() => handleInputPress('renovations')}
        >
          <Text style={renovations ? styles.inputText : styles.placeholderText}>
            {renovations || 'Yes/No, if yes, specify'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted3}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>

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
                          activeInput === 'homeName' ? 'Enter your home name' :
                          activeInput === 'houseAge' ? 'Enter the age of the house' :
                          activeInput === 'houseUse' ? 'Enter the primary use of the House' :
                          'Yes/No, if yes, specify'
                        }
                        placeholderTextColor="#BBBBBB"
                        keyboardType={activeInput === 'houseAge' ? 'numeric' : 'default'}
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
    flex: 1.1,
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
  },
  label: {
    fontSize: wp('3.7%'),
    color: '#05173F',
    textAlign: 'center',
    fontFamily: 'Archivo-Regular',
    letterSpacing: wp('0.25%'),
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp('90%'),
    marginBottom: hp('2%'),
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
    height: hp('6%'),
    borderRadius: wp('10%'),
    backgroundColor: '#D9D9D9',
    marginBottom: hp('1.2%'),
    justifyContent: 'center',
    alignItems: 'center',
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
  button: {
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('25%'),
    backgroundColor: '#08294E',
    borderRadius: wp('8%'),
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  buttonText: {
    fontSize: wp('4.5%'),
    color: '#FFFFFF',
    fontFamily: 'Archivo-Bold',
  },
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
    marginBottom: hp('-30%'),
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

export default GettingStarted2;