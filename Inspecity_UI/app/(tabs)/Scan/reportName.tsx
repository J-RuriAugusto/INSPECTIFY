import React, { useState } from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import HomeDetails from '../../../constants/HomeDetails'
import { useTranslation } from '../../../hooks/useTranslation';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ReportName = () => {
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
    'Epilogue-Medium': require('../../../assets/fonts/Epilogue-Medium.ttf'),
  });

  const [isModalVisible, setModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [reportName, setReportName] = useState('');
  const router = useRouter();
  const navigation = useNavigation();

  if (!fontsLoaded) {
    return null;
  }

  const saveImageToStorage = async (uri: string) => {
    const filename = uri.split('/').pop();
    
    // Check if documentDirectory is not null
    if (!FileSystem.documentDirectory) {
      console.error('Document directory is not available');
      return uri; // Fallback to the original URI
    }
  
    const newPath = FileSystem.documentDirectory + filename;
  
    try {
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
      return newPath;
    } catch (error) {
      console.error('Error saving image:', error);
      return uri; // Fallback to the original URI
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // Check if result.assets is not null and contains at least one asset
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsUploading(true);
      const savedUri = await saveImageToStorage(result.assets[0].uri);
      router.push({
        pathname: "./photoDetails",
        params: { 
          photo: savedUri,
          reportName: reportName,
          homeId: HomeDetails.homeId
        }
      });
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera is required!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // Check if result.assets is not null and contains at least one asset
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsUploading(true);
      const savedUri = await saveImageToStorage(result.assets[0].uri);
      router.push({
        pathname: "./photoDetails",
        params: { 
          photo: savedUri,
          reportName: reportName,
          homeId: HomeDetails.homeId
        }
      });
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
          <Text style={styles.backText}>{t('BACK')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title1}>{t('NAME_YOUR_REPORT')}</Text>
      {/* <Text style={styles.title2}>{t('ENTER_REPORT_NAME')}</Text> */}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('ENTER_REPORT_NAME')}
          placeholderTextColor="#A0A0A0"
          onChangeText={setReportName}
          value={reportName}
        />
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.nextButtonText}>{t('NEXT')}</Text>
      </TouchableOpacity>

      <Modal 
        isVisible={isModalVisible} 
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('CAPTURE_IMAGE')}</Text>
          
          <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
            <Text style={styles.modalButtonText}>{t('TAKE_PHOTO')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
            <Text style={styles.modalButtonText}>{t('PICK_GALLERY')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>{t('CLOSE')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Uploading Modal */}
      <Modal 
        isVisible={isUploading} 
        backdropOpacity={0.5}
        style={styles.uploadingModal}
      >
        <View style={styles.uploadingModalContent}>
          <ActivityIndicator size="large" color="#00A8E8" />
          <Text style={styles.uploadingText}>Uploading...</Text>
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
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title1: {
    fontFamily: 'Epilogue-Black',
    fontSize: wp('8%'), // 30px ≈ 8% width
    color: '#FFFFFF',
    textAlign:'center',
    marginBottom: 10,
  },
  title2: {
    fontFamily: 'Epilogue-Medium',
    fontSize: 18,
    color: '#4783C7',
    marginBottom: 20,
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { width: 30, height: 30, marginRight: 5 },
  backText: { fontSize: 17, color: '#FFFFFF' },
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
  uploadingModal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingModalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 18,
    fontFamily: 'Epilogue-Bold',
    color: '#002B5B',
  },
  
});

export default ReportName;
