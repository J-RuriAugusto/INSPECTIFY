// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView} from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { useFonts } from 'expo-font';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// const GettingStarted3 = () => {
//   const { homeData } = useLocalSearchParams();
//   console.log(homeData)
//   const router = useRouter();
//   const [age, setAge] = useState(''); // Separate state for Age
//   const [numFloor, setNumFloor] = useState(''); // Separate state for Height
//   const [lotArea, setLotArea] = useState(''); // Separate state for lot area
//   const [floorArea, setFloorArea] = useState(''); // Separate state for floor area
//   const [selectedHouseType, setSelectedHouseType] = useState(""); // Separate state for house type
//   const [selectedMaterial, setSelectedMaterial] = useState(""); // Separate state for material
//   const [otherMaterial, setOtherMaterial] = useState(''); // Separate state for other material
//   const [otherHouseType, setOtherHouseType] = useState(''); // Separate state for other house type

//   const [fontsLoaded] = useFonts({
//     'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
//     'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
//     'Archivo-Bold': require('../../../assets/fonts/Archivo-Bold.ttf'),
//   });

//   if (!fontsLoaded) {
//     return null;
//   }

//   const parsedHomeData = homeData 
//   ? JSON.parse(Array.isArray(homeData) ? homeData[0] : homeData) 
//   : {};

//   const handleNavigateToGetStarted3b = () => {
//     if (numFloor.trim() !== "" && (!/^\d+$/.test(numFloor) || parseInt(numFloor) <= 0)) {
//       alert("Number of house floors must be a positive whole number.");
//       return;
//     }
  
//     if (lotArea.trim() !== "" && (isNaN(parseFloat(lotArea)) || parseFloat(lotArea) <= 0)) {
//       alert("Estimated lot area must be a positive number.");
//       return;
//     }
  
//     if (floorArea.trim() !== "" && (isNaN(parseFloat(floorArea)) || parseFloat(floorArea) <= 0)) {
//       alert("Estimated floor area must be a positive number.");
//       return;
//     }
  
//     const updatedHomeData = {
//       ...parsedHomeData,
//       typeOfHouse: selectedHouseType === "others" 
//     ? (otherHouseType.trim() !== "" ? otherHouseType : null) 
//     : (selectedHouseType.trim() !== "" ? selectedHouseType : null),
//       numFloor: numFloor.trim() !== "" ? parseInt(numFloor) : null,
//       lotArea: lotArea.trim() !== "" ? parseFloat(lotArea) : null,
//       floorArea: floorArea.trim() !== "" ? parseFloat(floorArea) : null,
//     };
  
//     router.push({
//       pathname: './addproperty_3b',
//       params: { homeData: JSON.stringify(updatedHomeData) },
//     });
//   };
  
//   const currentStep = 3;

//   return (
//     <View style={styles.container}>
//       <View style={styles.upperSection}>
//         <Image source={require('../../../assets/images/houseGS3.png')} style={styles.image} resizeMode="contain" />
//       </View>

//       <View style={styles.lowerSection}>
//         {/* <View style={styles.progressBar}>
//           {Array.from({ length: 6 }).map((_, index) => (
//             <View
//               key={index}
//               style={[ 
//                 styles.progressStep, 
//                 index < currentStep ? styles.progressStepActive : styles.progressStepInactive 
//               ]}
//             />
//           ))}
//         </View> */}

//         <Text style={styles.title1}>Tell Us About Your Home</Text>
//         <Text style={styles.subtitle1}>Enter basic details about your home to begin.</Text>
//         {/* Scrollable form */}
//         <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                
//         <View style={styles.pickerContainer}>
//           <Picker selectedValue={selectedHouseType} onValueChange={(itemValue) => setSelectedHouseType(itemValue)} style={styles.picker}>
//             <Picker.Item label="Type of House" value="" enabled={false} />
//             <Picker.Item label="Single-detached" value="single" />
//             <Picker.Item label="Townhouse" value="town" />
//             <Picker.Item label="Apartment" value="apartment" />
//             <Picker.Item label="Stilt house" value="stilt" />
//             <Picker.Item label="Duplex" value="duplex" />
//             <Picker.Item label="Others" value="others" />
//           </Picker>
//         </View>

//         {selectedHouseType === "others" && (
//           <TextInput
//             style={styles.textBox1}
//             placeholder="Specify other house type"
//             placeholderTextColor="#BBBBBB"
//             value={otherHouseType}
//             onChangeText={(text) => setOtherHouseType(text)}
//           />
//         )}

//         <View style={styles.inputRow}>
//           <Text style={styles.label}>Enter the Height of the House</Text>
//           <TextInput 
//             style={styles.textBox} 
//             placeholder="(1, 2, 3, etc.)" 
//             placeholderTextColor="#BBBBBB" 
//             value={numFloor} 
//             onChangeText={(text) => setNumFloor(text)} 
//           />
//         </View>

//         <View style={styles.inputRow}>
//           <Text style={styles.label}>What is the estimated lot area?</Text>
//           <TextInput 
//             style={styles.textBox} 
//             placeholder="sqm" 
//             placeholderTextColor="#BBBBBB" 
//             value={lotArea} 
//             onChangeText={(text) => setLotArea(text)} 
//           />
//         </View>

//         <View style={styles.inputRow}>
//           <Text style={styles.label}>What is the estimated floor area?</Text>
//           <TextInput 
//             style={styles.textBox} 
//             placeholder="sqm" 
//             placeholderTextColor="#BBBBBB" 
//             value={floorArea} 
//             onChangeText={(text) => setFloorArea(text)} 
//           />
//         </View>

//         </ScrollView>

//         <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted3b}>
//           <Text style={styles.buttonText}>Next</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },

//   upperSection: {
//     flex: 1,
//     backgroundColor: '#0B417D',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   image: {
//     width: wp('100%'),
//     height: hp('50%'),
//   },

//   lowerSection: {
//     flex: 1.05,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: wp('5%'),
//   },

//   title1: {
//     fontSize: wp('6%'),
//     color: '#05173F',
//     textAlign: 'center',
//     fontFamily: 'Epilogue-Black',
//     letterSpacing: wp('0.25%'),
//     marginBottom: hp('0.4%'),
//     // marginTop: hp('-1.5%'),
//   },

//   subtitle1: {
//     fontSize: wp('4%'),
//     color: '#7C7C7C',
//     textAlign: 'center',
//     fontFamily: 'Archivo-Regular',
//     letterSpacing: wp('0.25%'),
//     marginBottom: hp('1.2%'),
//   },

//   // progressBar: {
//   //   flexDirection: 'row',
//   //   justifyContent: 'space-between',
//   //   width: wp('90%'),
//   //   // marginBottom: hp('2%'),
//   //   marginTop: -hp('2.5%'),
//   // },

//   // progressStep: {
//   //   width: wp('25%'),
//   //   height: hp('0.6%'),
//   //   borderRadius: wp('3%'),
//   // },

//   // progressStepActive: {
//   //   backgroundColor: '#0B417D',
//   // },

//   // progressStepInactive: {
//   //   backgroundColor: '#E0E0E0',
//   // },

//   textBox1: {
//     width: wp('80%'),
//     padding: wp('3%'),
//     borderRadius: wp('10%'),
//     backgroundColor: '#D9D9D9',
//     marginBottom: hp('1.2%'),
//   },

//   textBox: {
//     width: wp('30%'),
//     padding: wp('3%'),
//     borderRadius: wp('10%'),
//     fontFamily: 'Archivo-Regular',
//     fontSize: wp('3.5%'),
//     textAlign: 'center',
//     textAlignVertical: 'center',
//     backgroundColor: '#D9D9D9',
//     marginLeft: wp('2.5%'),
//   },

//   pickerContainer: {
//     width: wp('80%'),
//     backgroundColor: '#D9D9D9',
//     borderRadius: wp('10%'),
//     marginBottom: hp('1.8%'),
//   },

//   picker: {
//     height: hp('7%'),
//     fontSize: wp('3%'),
//     color: '#05173F',
//     textAlign: 'center',
//     textAlignVertical: 'top',
//   },

//   button: {
//     paddingVertical: hp('1.5%'),
//     paddingHorizontal: wp('25%'),
//     backgroundColor: '#08294E',
//     padding: wp('2.5%'),
//     borderRadius: wp('8%'),
//     alignItems: 'center',
//     marginBottom: hp('2.5%'),
//   },

//   buttonText: {
//     fontSize: wp('4.5%'),
//     color: '#FFFFFF',
//     fontFamily: 'Archivo-Bold',
//   },

//   inputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     width: wp('80%'),
//     marginBottom: hp('1.2%'),
//     marginLeft: wp('-11%'),
//     paddingHorizontal: wp('3%'),
//   },

//   label: {
//     fontSize: wp('3.7%'),
//     color: '#05173F',
//     fontFamily: 'Archivo-Regular',
//     textAlign: 'auto',
//   },
//   scrollView: { width: '100%', height:'100%' },
//   scrollContainer: { flexGrow: 1, alignItems: 'center', paddingBottom: 50 },

//   // scrollView: {
//   //   width: wp('100%'),
//   // },

//   // scrollContainer: {
//   //   flexGrow: 1,
//   //   alignItems: 'center',
//   //   paddingBottom: hp('6%'),
//   //   backgroundColor: '#000',
//   //   paddingHorizontal: wp('5%'),
//   // },
// });

// export default GettingStarted3;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Modal, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MaterialIcons } from '@expo/vector-icons';

const GettingStarted3 = () => {
  const { homeData } = useLocalSearchParams();
  const router = useRouter();
  const [numFloor, setNumFloor] = useState('');
  const [lotArea, setLotArea] = useState('');
  const [floorArea, setFloorArea] = useState('');
  const [selectedHouseType, setSelectedHouseType] = useState("");
  const [otherHouseType, setOtherHouseType] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [currentInput, setCurrentInput] = useState(null);
  const [inputValue, setInputValue] = useState('');

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

  if (!fontsLoaded) {
    return null;
  }

  const parsedHomeData = homeData 
    ? JSON.parse(Array.isArray(homeData) ? homeData[0] : homeData) 
    : {};

  const handleInputPress = (inputName, currentValue) => {
    setCurrentInput(inputName);
    setInputValue(currentValue);
    setModalVisible(true);
  };

  const handleModalSubmit = () => {
    switch(currentInput) {
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
    setModalVisible(false);
    Keyboard.dismiss();
  };

  const handleNavigateToGetStarted3b = () => {
    if (numFloor.trim() !== "" && (!/^\d+$/.test(numFloor) || parseInt(numFloor) <= 0)) {
      alert("Number of house floors must be a positive whole number.");
      return;
    }
  
    if (lotArea.trim() !== "" && (isNaN(parseFloat(lotArea)) || parseFloat(lotArea) <= 0)) {
      alert("Estimated lot area must be a positive number.");
      return;
    }
  
    if (floorArea.trim() !== "" && (isNaN(parseFloat(floorArea)) || parseFloat(floorArea) <= 0)) {
      alert("Estimated floor area must be a positive number.");
      return;
    }
  
    const updatedHomeData = {
      ...parsedHomeData,
      typeOfHouse: selectedHouseType === "others" 
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

  const getInputLabel = () => {
    switch(currentInput) {
      case 'numFloor': return 'Number of Floors';
      case 'lotArea': return 'Lot Area (sqm)';
      case 'floorArea': return 'Floor Area (sqm)';
      case 'otherHouseType': return 'Other House Type';
      default: return '';
    }
  };

  const getKeyboardType = () => {
    if (currentInput === 'numFloor') return 'number-pad';
    return 'decimal-pad';
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
              onPress={() => handleInputPress('otherHouseType', otherHouseType)}
            >
              <Text style={otherHouseType ? styles.inputText : styles.placeholderText}>
                {otherHouseType || "Specify other house type"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.inputRow}>
            <Text style={styles.label}>Enter the Height of the House</Text>
            <TouchableOpacity 
              style={styles.textBox} 
              onPress={() => handleInputPress('numFloor', numFloor)}
            >
              <Text style={numFloor ? styles.inputText : styles.placeholderText}>
                {numFloor || "(1, 2, 3, etc.)"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>What is the estimated lot area?</Text>
            <TouchableOpacity 
              style={styles.textBox} 
              onPress={() => handleInputPress('lotArea', lotArea)}
            >
              <Text style={lotArea ? styles.inputText : styles.placeholderText}>
                {lotArea || "sqm"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>What is the estimated floor area?</Text>
            <TouchableOpacity 
              style={styles.textBox} 
              onPress={() => handleInputPress('floorArea', floorArea)}
            >
              <Text style={floorArea ? styles.inputText : styles.placeholderText}>
                {floorArea || "sqm"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={handleNavigateToGetStarted3b}>
          <Text style={styles.buttonText}>Next</Text>
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
                    <View style={styles.inputRow}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: wp('5%'),
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
  },
  modalLabel: {
    fontSize: wp('4%'),
    color: '#05173F',
    fontFamily: 'Archivo-Bold',
    marginBottom: hp('1%'),
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: wp('2%'),
    padding: wp('4%'),
    fontSize: wp('4.5%'),
    fontFamily: 'Archivo-Regular',
    marginBottom: hp('3%'),
  },
  modalButton: {
    backgroundColor: '#08294E',
    borderRadius: wp('5%'),
    padding: wp('4%'),
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontFamily: 'Archivo-Bold',
  },
});

export default GettingStarted3;