import React, { useState } from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';

const ReportName = () => {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
    'Epilogue-Medium': require('../../../assets/fonts/Epilogue-Medium.ttf'),
  });

  const [isModalVisible, setModalVisible] = useState(false);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

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

      {/* Bottom Sheet Modal */}
      <Modal 
        isVisible={isModalVisible} 
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Capture Image</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => alert('Take Photo')}>
            <Text style={styles.modalButtonText}>Take a Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={() => alert('Pick from Gallery')}>
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
    padding: 20,
    backgroundColor: '#002B5B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  backText: {
    fontFamily: 'Epilogue-Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
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
    borderRadius: 20,
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
});

export default ReportName;
