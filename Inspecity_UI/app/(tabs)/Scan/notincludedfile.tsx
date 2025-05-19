import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Link } from 'expo-router';

const AssessStructure = () => {
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
      <Text style={styles.title1}>SELECT STRUCTURE</Text>
      <Text style={styles.title1}>TYPE</Text>
      <Text style={styles.title3}>What are you scanning?</Text>

      {/* Button Containers */}
      <View style={styles.column}>
        <Link href="/Scan/reportName" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <View style={styles.buttonContent}>
              <Image
                source={require('../../../assets/images/wall-icon.png')}
                style={styles.icon}
              />
              <Text style={styles.buttonText}>WALL</Text>
            </View>
          </TouchableOpacity>
        </Link>
        <Link href="/Scan/reportName" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <View style={styles.buttonContent}>
              <Image
                source={require('../../../assets/images/roof-icon.png')}
                style={styles.icon}
              />
              <Text style={styles.buttonText}>ROOF</Text>
            </View>
          </TouchableOpacity>
        </Link>
        <Link href="/Scan/reportName" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <View style={styles.buttonContent}>
              <Image
                source={require('../../../assets/images/floor-icon.png')}
                style={styles.icon}
              />
              <Text style={styles.buttonText}>FLOOR</Text>
            </View>
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
    backgroundColor: '#002B5B',
    paddingTop: 70,
  },
  title1: {
    fontSize: 30,
    color: '#FFFFFF',
    fontFamily: 'Epilogue-Black',
    textAlign: 'center',
  },
  title2: {
    fontSize: 30,
    color: '#FFFFFF',
    fontFamily: 'Epilogue-Black',
    textAlign: 'center',
  },
  title3: {
    fontSize: 18,
    color: '#4783C7',
    fontFamily: 'Epilogue-Medium',
    marginBottom: 20,
  },
  column: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  largeContainer: {
    width: '80%',
    height: 150,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#0B417D',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 48,
    fontFamily: 'Epilogue-Black',
    color: '#08294E',
    marginLeft: 10,
    textAlign: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});

export default AssessStructure;
