import React from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';

const Wall = () => {
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

      <Text style={styles.title1}>NAME YOUR REPORT</Text>
      <Text style={styles.title2}>Enter a report name</Text>

      <TouchableOpacity style={styles.nextButton} onPress={() => alert('Start button pressed')}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
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
    marginBottom: 30,
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
});

export default Wall;
