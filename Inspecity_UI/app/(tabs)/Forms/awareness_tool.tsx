import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useFonts } from 'expo-font';

const AwarenessTool = () => {
  // const [fontsLoaded] = useFonts({
  //   'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
  //   'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
  //   'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
  //   'Epilogue-Medium': require('../../../assets/fonts/Epilogue-Medium.ttf'),
  // });

  // if (!fontsLoaded) {
  //   return null;
  // }

  return (
    <View style={styles.container}>
      <Text style={styles.title1}>Check Your Disaster Preparedness.</Text>
      <Text style={styles.title2}>Select Disaster Type</Text>

      {/* Button Containers */}
      <View style={styles.row}>
        <Link href="/Forms/flood" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <Image
              source={require('../../../assets/images/flood-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>FLOOD</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/Forms/earthquake" asChild>
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
        <Link href="/Forms/typhoon" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <Image
              source={require('../../../assets/images/typhoon-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>TYPHOON</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/Forms/general" asChild>
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
    paddingTop: hp('10%'), // replaces 80px
  },
  title1: {
    fontSize: wp('8%'), // replaces 30px
    color: '#000000',
    fontFamily: 'Epilogue-Black',
    textAlign: 'center',
  },
  title2: {
    fontSize: wp('4.8%'), // replaces 18px
    color: '#4783C7',
    fontFamily: 'Epilogue-Medium',
    marginBottom: hp('6%'), // replaces 40px
  },
  row: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('5%'), // replaces 20px
    width: '100%',
    paddingHorizontal: wp('8%'), // replaces 30px
  },
  largeContainer: {
    width: '45%',
    height: hp('25%'), // replaces 200px
    backgroundColor: '#0B417D',
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: hp('2%'), // replaces 20px
    borderRadius: wp('4%'),
    borderWidth: 2,
    borderColor: '#0B417D',
  },
  buttonText: {
    fontSize: wp('6.5%'), // replaces 25px
    fontFamily: 'Epilogue-Black',
    color: '#FFFFFF',
    marginTop: hp('1.2%'), // replaces 10px
    textAlign: 'center',
  },
  icon: {
    width: wp('18%'), // replaces 70px
    height: wp('18%'),
    resizeMode: 'contain',
  },
});

export default AwarenessTool;
