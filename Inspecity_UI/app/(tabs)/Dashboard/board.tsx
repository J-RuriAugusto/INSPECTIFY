import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Image, TextInput, TouchableOpacity, Alert, FlatList, ScrollView, View, BackHandler, RefreshControl } from 'react-native';
import { Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { Text } from '@/components/Themed';
import useUserID from "../../useUserID";
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import HomeDetails from '../../../constants/HomeDetails'
import { Link } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from '../../../hooks/useTranslation';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface Report {
  report_id: string;
  report_name: string;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const [search, setSearch] = React.useState('');
  const userId = useUserID();
  const [houseName, setHouseName] = useState('NAME OF HOUSE');
  const [location, setLocation] = useState('LOCATION');
  const [reportsTitleID, setReportsTitleID] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const API_KEY = '***REMOVED***';
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        Alert.alert(
          t('NO_INTERNET_TITLE'),
          t('NO_INTERNET_MESSAGE'),
          [
            { text: t('OK'), onPress: () => BackHandler.exitApp() }
          ]
        );
      }
    });

    return () => unsubscribe();
  }, []);
    
  useEffect(() => {
    if (userId) {
      fetchHouseDetails(userId);
    }
  }, [userId]);

  useEffect(() => {
    const homeId = HomeDetails.homeId;
    if (homeId) {
      fetchReportTitles(homeId).then(reports => {
        setReportsTitleID(reports);
      });
    }
  }, [HomeDetails.homeId]);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        BackHandler.exitApp();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );

  const fetchHouseDetails = async (userId: string) => {
    try {
      console.log(`Fetching details for user: ${userId}`);
  
      const response = await fetch(
        `https://flask-railway-sample-production.up.railway.app/homeowners/${userId}/default_home`,
        {
          method: 'GET',
          headers: {
            'X-API-KEY': API_KEY,
          },
        }
      );
  
      if (response.status === 404) {
        // console.log("No default home found.");
        // Alert.alert(
        //   "No Home Created",
        //   "Click OK to create home.",
        //   [
        //     {
        //       text: "OK",
        //       onPress: () => router.push('./board/MyProperties')
        //     }
        //   ]
        // );
        // setHouseName("NAME OF HOUSE");
        // setLocation("LOCATION");
        return;
      }
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(`default home data: ${JSON.stringify(data, null, 2)}`);
      setHouseName(data.home_name && data.home_name.trim() ? data.home_name : t('HOUSE_NAME_PLACEHOLDER'));
      HomeDetails.setHomeId(data.home_id);
  
      if (data.latitude && data.longitude) {
        HomeDetails.setHomeLocation(data.latitude, data.longitude);
        
        try {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: data.latitude,
            longitude: data.longitude
          });
          
          if (reverseGeocode.length > 0) {
            const { city, region, street, name, district } = reverseGeocode[0];
            const formattedLocation = [
              name,
              street,
              district,
              city,
              region
            ].filter(Boolean).join(', ');
            setLocation(formattedLocation.trim());
          } else {
            setLocation(`${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`);
          }
        } catch (geocodeError) {
          console.warn("Reverse geocoding failed:", geocodeError);
          setLocation(`${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`);
        }
      } else {
        setLocation(t('LOCATION_PLACEHOLDER'));
      }
    } catch (error) {
      let errorMessage = "Backend is not accessible.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.log("Error fetching house details:", errorMessage);
      Alert.alert(t('ERROR_FETCHING_HOUSE'), errorMessage);
      setHouseName(t('HOUSE_NAME_PLACEHOLDER'));
      setLocation(t('LOCATION_PLACEHOLDER'));
    }
  };
  

  const fetchReportTitles = async (homeId: string) => {
    try {
      const response = await fetch(`https://flask-railway-sample-production.up.railway.app/reportNamesIDs?home_id=${homeId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report titles');
      }

      const data = await response.json();
      return data.reports;
    } catch (error) {
      Alert.alert(t('ERROR_FETCHING_REPORTS'));
      return [];
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true); // Start refresh animation
  
    try {
      if (!userId) throw new Error("User ID not available");
  
      await fetchHouseDetails(userId);
  
      const homeId = HomeDetails.homeId;
      if (homeId) {
        const reports = await fetchReportTitles(homeId);
        setReportsTitleID(reports);
      }
    } catch (error) {
      console.error("Refresh failed.");
    } finally {
      setRefreshing(false);
    }
  }, [userId]);
  
  
  if (!fontsLoaded) {
    return null; 
  }

  const savedShops = [
    { id: '1', image: require('../../../assets/images/shop1.png') },
    { id: '2', image: require('../../../assets/images/shop2.png') },
    { id: '3', image: require('../../../assets/images/shop2.png') },
    { id: '4', image: require('../../../assets/images/shop2.png') },
  ];

  const handleShopPress = (id: string) => {
    Alert.alert(`Shop ${id} Pressed!`);
  };

  const handleReportPress = (id: string) => {
    router.push({ pathname: '/(tabs)/Scan/reportDetails', params: {report_id: id } });
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
      {/* Header with House and Settings Icons */}
      <View style={styles.header}>
        <Link href="/(tabs)/Dashboard/MyProperties" asChild>
          <TouchableOpacity>
            <Image source={require('../../../assets/images/houseicon.png')} style={styles.headerIcon} />
          </TouchableOpacity>
        </Link>

        <Link href="./settings" asChild>
        <TouchableOpacity>            
          <Image source={require('../../../assets/images/settings_icon.png')} style={styles.headerIcon} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Main Content */}
      <Text style={styles.title1}>{houseName}</Text>
      <Text style={styles.title2}>{location}</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder={t('SEARCH_PLACEHOLDER')}
        placeholderTextColor="#AFAFAF"
        value={search}
        onChangeText={setSearch}
      />

      {/* Saved Shops (Horizontal Scroll) */}
      <Text style={styles.title3}>{t('SAVED_SHOPS')}</Text>
      <FlatList
        data={savedShops}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleShopPress(item.id)}>
            <Image source={item.image} style={styles.shopImage} />
          </TouchableOpacity>
        )}
      />

      {/* Reports Section (Vertical Scroll) */}
      <Text style={styles.title4}>{t('REPORTS')}</Text>
        <View style={{ flex: 1, backgroundColor: 'FFFFFF' }}>
          <ScrollView contentContainerStyle={styles.reportsContainer}>
            {reportsTitleID.length === 0 ? (
              <View style={styles.noReportsContainer}>
                <Text style={styles.noReportsText}>{t('NO_REPORTS')}</Text>
              </View>
            ) : (
              reportsTitleID.map((report) => (
                <TouchableOpacity 
                  key={report.report_id} 
                  onPress={() => handleReportPress(report.report_id)} 
                  style={styles.reportItem}
                >
                  <View style={styles.reportContent}>
                    <Image 
                      source={require('../../../assets/images/report_icon.png')} 
                      style={styles.reportIcon}
                    />
                    <Text style={styles.reportText}>{report.report_name || t('UNTITLED')}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: hp('8%'),
    paddingHorizontal: wp('6%'),
    // paddingBottom: hp('1.8%'),
    width: '100%'
  },
  header: {
    position: 'absolute',
    paddingTop: hp('3%'),
    paddingHorizontal: wp('5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp('100%'),
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    width: wp('8%'),
    height: wp('8.5%'),
  },
  title1: {
    fontSize: wp('6.5%'),
    color: '#05173F',
    fontFamily: 'Epilogue-Black',
    alignSelf: 'center'
  },
  title2: {
    fontSize: wp('4.5%'),
    color: '#AFAFAF',
    fontFamily: 'Archivo-Regular',
    marginBottom: hp('1%'),
    alignSelf: 'center'
  },
  title3: {
    fontSize: wp('4.8%'),
    color: '#071C34',
    fontFamily: 'Epilogue-Bold',
    alignSelf: 'flex-start',
    marginTop: hp('1.5%'),
    marginBottom: hp('1.5%'),
  },
  title4: {
    fontSize: wp('4.8%'),
    color: '#071C34',
    fontFamily: 'Epilogue-Bold',
    alignSelf: 'flex-start',
    marginBottom: hp('1.5%'),
  },
  searchBar: {
    height: hp('5%'),
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: wp('6%'),
    paddingHorizontal: wp('5%'),
    fontSize: wp('4%'),
    color: '#C0C0C0',
    backgroundColor: '#FFFFFF',
  },
  shopImage: {
    width: wp('30%'),
    height: wp('33%'),
    borderRadius: wp('3%'),
    marginHorizontal: wp('2.0%'),
    marginBottom: hp('10%'),
  },
  noReportsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: hp('6%'),
  },
  noReportsText: {
    fontSize: wp('4.5%'),
    textAlign: 'center',
    color: '#AFAFAF',
    fontFamily: 'Archivo-Regular',
  },
  reportsContainer: {
    width: '100%',
    paddingBottom: hp('27%'),
  },
  reportItem: {
    padding: wp('4%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    marginBottom: hp('1.2%'),
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: wp('5%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  reportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: wp('2%'),
  },
  reportIcon: {
    width: wp('5.5%'),
    height: wp('5.5%'),
    marginRight: wp('2%'),
  },
  reportText: {
    fontSize: wp('4.5%'),
    color: '#2B3C62',
    fontFamily: 'Epilogue-Bold',
    textAlign: 'left'
  }
});
                
export default Dashboard;
