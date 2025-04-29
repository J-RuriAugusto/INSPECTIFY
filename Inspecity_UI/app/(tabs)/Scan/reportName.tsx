import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ReportName = () => {
  // const [fontsLoaded] = useFonts({
  //   'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
  //   'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
  //   'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
  //   'Epilogue-Medium': require('../../../assets/fonts/Epilogue-Medium.ttf'),
  // });

  // if (!fontsLoaded) {
  //   return null;
  // }
  
  const [isModalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: "/Scan/photoDetails",
        params: { photo: result.assets[0].uri }
      });
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera is required!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: "/Scan/photoDetails",
        params: { photo: result.assets[0].uri }
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title1}>NAME YOUR REPORT</Text>
      <Text style={styles.title2}>Enter a report name</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Report Name"
          placeholderTextColor="#A0A0A0"
        />
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      <Modal 
        isVisible={isModalVisible} 
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Capture Image</Text>
          
          <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
            <Text style={styles.modalButtonText}>Take a Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
            <Text style={styles.modalButtonText}>Pick from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('5%'), // 20px ≈ 5% width
    backgroundColor: '#002B5B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // header: {
  //   position: 'absolute',
  //   top: hp('5%'), // 40px ≈ 5% height
  //   left: wp('5%'),
  //   right: wp('5%'),
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  // },
  title1: {
    fontFamily: 'Epilogue-Black',
    fontSize: wp('8%'), // 30px ≈ 8% width
    color: '#FFFFFF',
  },
  title2: {
    fontFamily: 'Epilogue-Medium',
    fontSize: wp('4.8%'), // 18px ≈ 4.8%
    color: '#4783C7',
    marginBottom: hp('2.5%'), // 20px ≈ 2.5%
  },
  inputContainer: {
    width: wp('70%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('10%'),
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('1%'),
    marginBottom: hp('2.5%'),
  },
  input: {
    fontFamily: 'Epilogue-Medium',
    fontSize: wp('4.8%'),
    color: '#000000',
  },
  nextButton: {
    backgroundColor: '#00A8E8',
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('10%'),
    borderRadius: wp('5%'),
  },
  nextButtonText: {
    fontFamily: 'Epilogue-Black',
    fontSize: wp('6.5%'),
    color: '#FFFFFF',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: wp('5%'),
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: wp('5.8%'), // 22px
    fontFamily: 'Epilogue-Bold',
    marginBottom: hp('1.2%'),
  },
  modalButton: {
    backgroundColor: '#00A8E8',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('5.5%'),
    borderRadius: wp('2.5%'),
    marginVertical: hp('0.6%'),
    width: wp('80%'),
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'Epilogue-Black',
    fontSize: wp('4.8%'),
    color: '#FFFFFF',
  },
  closeButton: {
    marginTop: hp('1.2%'),
  },
  closeButtonText: {
    fontSize: wp('4.2%'),
    fontFamily: 'Epilogue-Medium',
    color: '#002B5B',
  },
});

export default ReportName;
