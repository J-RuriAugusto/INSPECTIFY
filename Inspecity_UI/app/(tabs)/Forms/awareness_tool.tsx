import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useFonts } from 'expo-font';
import { useTranslation } from '../../../hooks/useTranslation';

const AwarenessTool = () => {
  const { t } = useTranslation();
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
      {/* Text Container */}
      <View style={styles.textContainer}>
        <Text 
          style={styles.title1}
          numberOfLines={2}
          ellipsizeMode="tail"
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {t('CHECK_DISASTER')}
        </Text>
        <Text 
          style={styles.title2}
          numberOfLines={1}
          ellipsizeMode="tail"
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {t('SELECT_DISASTER')}
        </Text>
      </View>

      {/* Button Containers */}
      <View style={styles.row}>
        <Link href="/Forms/flood" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <Image
              source={require('../../../assets/images/flood-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>{t('FLOOD')}</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/Forms/earthquake" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <Image
              source={require('../../../assets/images/earthquake-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.buttonText3}>{t('EARTHQUAKE')}</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.row}>
        <Link href="/Forms/fire" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <Image
              source={require('../../../assets/images/fire-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>{t('FIRE')}</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/Forms/general" asChild>
          <TouchableOpacity style={styles.largeContainer}>
            <Image
              source={require('../../../assets/images/general-icon.png')}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>{t('GENERAL')}</Text>
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
    paddingTop: hp('10%'),
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
    marginBottom: hp('2%'),
  },
  title1: {
    fontSize: wp('8.5%'),
    color: '#000000',
    fontFamily: 'Epilogue-Black',
    textAlign: 'center',
    maxWidth: '100%',
  },
  title2: {
    fontSize: wp('5%'),
    color: '#4783C7',
    fontFamily: 'Epilogue-Medium',
    textAlign: 'center',
    maxWidth: '100%',
    marginTop: hp('1%'),
    lineHeight: hp('3%'),
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
    paddingLeft: wp('1.5%'),
    paddingRight: wp('1.5%')

  },
    buttonText3: {
    fontSize: wp('6.5%'), // replaces 25px
    fontFamily: 'Epilogue-Black',
    color: '#FFFFFF',
    marginTop: hp('1.2%'), // replaces 10px
    textAlign: 'center',
    paddingLeft: wp('5.5%'),
    paddingRight: wp('5.5%')

  },
  buttonText2: {
    fontSize: wp('6.5%'), // replaces 25px
    fontFamily: 'Epilogue-Black',
    color: '#FFFFFF',
    marginTop: hp('-0.9%'), // replaces 10px
    textAlign: 'center',
  },
  icon: {
    width: wp('18%'), // replaces 70px
    height: wp('18%'),
    resizeMode: 'contain',
  },
});

export default AwarenessTool;
