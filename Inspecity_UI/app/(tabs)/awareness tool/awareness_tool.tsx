import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Link } from 'expo-router';

const AwarenessTool = () => {
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
      <Text style={styles.title1}>Check Your Disaster Preparedness.</Text>
      <Text style={styles.title2}>Select Disaster Type</Text>

      {/* Button Containers */}
      <View style={styles.row}>
        <Link href="/awareness tool/flood" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <Image
              source={require('../../../assets/images/flood-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>FLOOD</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/awareness tool/earthquake" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <Image
              source={require('../../../assets/images/earthquake-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>EARTHQUAKE</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.row}>
        <Link href="/awareness tool/typhoon" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <Image
              source={require('../../../assets/images/typhoon-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>TYPHOON</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/awareness tool/general" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <Image
              source={require('../../../assets/images/general-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>GENERAL</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingTop: 80,
  },
  title1: {
    fontSize: 30,
    color: '#000000',
    fontFamily: 'Epilogue-Bold',
    textAlign: 'center',
  },
  title2: {
    fontSize: 18,
    color: '#4783C7',
    fontFamily: 'Epilogue-Medium',
    marginBottom: 40,
  },
  row: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 30,
  },
  largeContainer: {
    width: '45%',
    height: 200,
    backgroundColor: '#0B417D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#0B417D',
  },
  buttonText: {
    fontSize: 25,
    fontFamily: 'Epilogue-Black',
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
  },
  icon: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
});

export default AwarenessTool;
