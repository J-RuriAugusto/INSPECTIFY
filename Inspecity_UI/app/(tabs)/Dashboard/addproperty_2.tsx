import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Alert, 
  Modal, 
  Keyboard,
  Pressable,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MaterialIcons } from '@expo/vector-icons';

import { useTranslation } from '../../../hooks/useTranslation';

const GettingStarted2 = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [homeName, setHomeName] = useState('');
  const [houseAge, setHouseAge] = useState('');
  const [houseUse, setHouseUse] = useState('');
  const [renovations, setRenovations] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [activeInput, setActiveInput] = useState<Field | null>(null);
  const textInputRef = useRef<TextInput>(null);
  
  // Load custom fonts
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
    switch(activeInput) {
      case 'homeName': setHomeName(inputValue); break;
      case 'houseAge': setHouseAge(inputValue); break;
      case 'houseUse': setHouseUse(inputValue); break;
      case 'renovations': setRenovations(inputValue); break;
    }
    setActiveInput(null);
    Keyboard.dismiss();
  };

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
  
    setHouseAge(age.toString());
  
    const homeData = JSON.stringify({ 
      homeName, 
      houseAge: age,
      houseUse: houseUse.trim() !== "" ? houseUse : null, 
      renovations: renovations.trim() !== "" ? renovations : null
    });
  
    router.push({
      pathname: './addproperty_3',
      params: { homeData },
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Upper Blue Section */}
      <View style={styles.upperSection}>
        <Image
          source={require('../../../assets/images/houseGS2.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Lower White Section */}
      <View style={styles.lowerSection}>
        <Text style={styles.title1}>{t('ADD_NEW_HOME')}</Text>
        <Text style={styles.subtitle1}>{t('BASIC_HOME_DETAILS')}</Text>
        <Text style={styles.subtitle2}>{t('BASIC_HOME_DETAILS2')}</Text>

        {/* Input Fields as TouchableOpacity */}
        {/* Modified Input Fields with dynamic text color */}
        <TouchableOpacity 
          style={[styles.textBox, styles.lowerPlaceholder]} 
          onPress={() => handleInputPress('homeName')}
        >
          <Text style={[styles.placeholderText, homeName ? styles.filledText : null]}>
            {homeName || t('ENTER_HOME_NAME')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.textBox, styles.lowerPlaceholder]} 
          onPress={() => handleInputPress('houseAge')}
        >
          <Text style={[styles.placeholderText, houseAge ? styles.filledText : null]}>
            {houseAge || t('ENTER_HOUSE_AGE')}
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity 
          style={[styles.textBox, styles.lowerPlaceholder]} 
          onPress={() => handleInputPress('houseUse')}
        >
          <Text style={[styles.placeholderText, houseUse ? styles.filledText : null]}>
            {houseUse || t('ENTER_PRIMARY_USE')}
          </Text>
        </TouchableOpacity> */}

        <Text style={styles.label}>{t('HAS_RENOVATIONS')}</Text>

        <TouchableOpacity 
          style={[styles.textBox, styles.lowerPlaceholder]} 
          onPress={() => handleInputPress('renovations')}
        >
          <Text style={[styles.placeholderText, renovations ? styles.filledText : null]}>
            {renovations || t('RENOVATIONS_GUIDE')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted3}>
          <Text style={styles.buttonText}>{t('NEXT')}</Text>
        </TouchableOpacity>
      </View>

      {/* Fixed Position Input Modal */}
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
              <View style={styles.inputRow}>
                <TextInput
                  ref={textInputRef}
                  style={styles.modalInput}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={
                    activeInput === 'homeName' ? t('ENTER_HOME_NAME') :
                    activeInput === 'houseAge' ? t('ENTER_HOUSE_AGE') :
                    activeInput === 'houseUse' ? t('ENTER_PRIMARY_USE') :
                    t('RENOVATIONS_GUIDE')
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
    marginTop: hp('0.5%'),
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
  textBox: {
    width: wp('80%'),
    height: hp('4.5%'),
    padding: wp('1%'),
    borderRadius: wp('10%'),
    fontFamily: 'Archivo-Regular',
    fontSize: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    marginBottom: hp('1.2%'),
  },
  placeholderText: {
    color: '#BBBBBB',
    fontFamily: 'Archivo-Regular',
    fontSize: wp('4%'),
  },
  filledText: {
    color: '#000000', // Black color for filled inputs
  },
  button: {
    marginBottom: hp('1%'),
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
  inputRow: {
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

export default GettingStarted2;