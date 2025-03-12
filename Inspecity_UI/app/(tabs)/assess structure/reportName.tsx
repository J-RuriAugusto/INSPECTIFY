import React, { useState } from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import HomeDetails from '../../../constants/HomeDetails'

const ReportName = () => {
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
        pathname: "/assess structure/photoDetails",
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
        pathname: "/assess structure/photoDetails",
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
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title1}>NAME YOUR REPORT</Text>
      <Text style={styles.title2}>Enter a report name</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Report Name"
          placeholderTextColor="#A0A0A0"
          onChangeText={setReportName}
          value={reportName}
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
    padding: 20,
    backgroundColor: '#002B5B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { width: 30, height: 30, marginRight: 5 },
  backText: { fontSize: 17, color: '#FFFFFF' },
  title1: {
    fontFamily: 'Epilogue-Black',
    fontSize: 30,
    color: '#FFFFFF',
  },
  title2: {
    fontFamily: 'Epilogue-Medium',
    fontSize: 18,
    color: '#4783C7',
    marginBottom: 20,
  },
  inputContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 30,
  },
  input: {
    fontFamily: 'Epilogue-Medium',
    fontSize: 18,
    color: '#000000',
  },
  nextButton: {
    backgroundColor: '#00A8E8',
    paddingVertical: 5,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  nextButtonText: {
    fontFamily: 'Epilogue-Black',
    fontSize: 25,
    color: '#FFFFFF',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Epilogue-Bold',
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#00A8E8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
    width: '80%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'Epilogue-Black',
    fontSize: 18,
    color: '#FFFFFF',
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
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
