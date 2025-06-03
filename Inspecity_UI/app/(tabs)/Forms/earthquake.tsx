import React, { useState } from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity, ImageBackground, Dimensions, Modal, Pressable } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../../../hooks/useTranslation';

const { width, height } = Dimensions.get('window');

const Earthquake = () => {
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
    'Epilogue-Medium': require('../../../assets/fonts/Epilogue-Medium.ttf'),
  });

  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  
  if (!fontsLoaded) return null;

  const handleStartPress = () => {
    setModalVisible(true);
  };

  const acceptDisclaimer = () => {
    setModalVisible(false);
    navigation.navigate('earthquakeQueries');
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/earthquake_bg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
        <Text style={styles.backText}>{t('BACK')}</Text>
      </TouchableOpacity>

      {/* EARTHQUAKE Label at the top */}
      <View style={styles.textContainer}>
        <Image source={require('../../../assets/images/earthquake-icon.png')} style={styles.icon} />
        <Text style={styles.title1}>{t('EARTHQUAKE')}</Text>
      </View>

      {/* Centered content */}
      <View style={styles.content}>
        <Text style={styles.title2}>{t('CATEGORY')}</Text>

        <TouchableOpacity style={styles.startButton} onPress={handleStartPress}>
          <Text style={styles.startButtonText}>{t('START')}</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('DISCLAIMER')}</Text>
            <Text style={styles.modalText}>
              {t('DISCLAIMER_TEXT')}
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>{t('CANCEL')}</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.acceptButton]}
                onPress={acceptDisclaimer}
              >
                <Text style={styles.buttonText}>{t('ACCEPT')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.05,
  },
  backButton: {
    position: 'absolute',
    top: height * 0.05,
    left: width * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: width * 0.07,
    height: width * 0.07,
    marginRight: width * 0.01,
  },
  backText: {
    fontFamily: 'Epilogue-Bold',
    fontSize: width * 0.045,
    color: '#FFFFFF',
  },
  textContainer: {
    top: height * 0.12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: width * 0.1,
    height: width * 0.1,
    marginRight: width * 0.025,
  },
  title1: {
    fontFamily: 'Epilogue-Black',
    fontSize: width * 0.08,
    color: '#FFFFFF',
  },
  title2: {
    fontFamily: 'Epilogue-Black',
    fontSize: width * 0.12,
    color: '#5CD2FF',
    marginBottom: height * 0.01,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#00A8E8',
    paddingVertical: height * 0.002,
    paddingHorizontal: width * 0.1,
    borderRadius: width * 0.07,
  },
  startButtonText: {
    fontFamily: 'Epilogue-Black',
    fontSize: width * 0.065,
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: width * 0.05,
    padding: width * 0.05,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Epilogue-Bold',
    fontSize: width * 0.06,
    color: '#333',
    marginBottom: height * 0.02,
  },
  modalText: {
    fontFamily: 'Archivo-Regular',
    fontSize: width * 0.04,
    color: '#555',
    textAlign: 'center',
    marginBottom: height * 0.03,
    lineHeight: height * 0.025,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    borderRadius: width * 0.03,
    flex: 1,
    marginHorizontal: width * 0.02,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  acceptButton: {
    backgroundColor: '#00A8E8',
  },
  buttonText: {
    fontFamily: 'Epilogue-Bold',
    fontSize: width * 0.04,
    color: '#FFFFFF',
  },
});

export default Earthquake;