import React from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const Earthquake = () => {
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
    'Epilogue-Medium': require('../../../assets/fonts/Epilogue-Medium.ttf'),
  });

  const navigation = useNavigation();
  
  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require('../../../assets/images/earthquake_bg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* EARTHQUAKE Label at the top */}
      <View style={styles.textContainer}>
        <Image source={require('../../../assets/images/earthquake-icon.png')} style={styles.icon} />
        <Text style={styles.title1}>EARTHQUAKE</Text>
      </View>

      {/* Centered content */}
      <View style={styles.content}>
        <Text style={styles.title2}>CATEGORY</Text>

        <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('earthquakeQueries')}>
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
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
    width: width * 0.07,     // ~7% of screen width
    height: width * 0.07,
    marginRight: width * 0.01,
  },
  backText: {
    fontFamily: 'Epilogue-Bold',
    fontSize: width * 0.045, // ~16-18px on standard phones
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
});

export default Earthquake;
