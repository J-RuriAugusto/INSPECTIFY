import React from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';

const Flood = () => {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
    'Epilogue-Medium': require('../../../assets/fonts/Epilogue-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require('../../../assets/images/back-icon.png')} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.floodContainer}>
        <Image source={require('../../../assets/images/flood-icon.png')} style={styles.icon} />
        <Text style={styles.floodText}>FLOOD</Text>
      </View>

      <Text style={styles.locationText}>LOCATION & GEOGRAPHY</Text>

      <TouchableOpacity style={styles.startButton} onPress={() => alert('Start button pressed')}>
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0B417D',
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
  floodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  floodText: {
    fontFamily: 'Epilogue-Black',
    fontSize: 30,
    color: '#FFFFFF',
  },
  locationText: {
    fontFamily: 'Epilogue-Bold',
    fontSize: 50,
    color: '#00A8E8',
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#00A8E8',
    paddingVertical: 5,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  startButtonText: {
    fontFamily: 'Epilogue-Black',
    fontSize: 25,
    color: '#FFFFFF',
  },
});

export default Flood;
