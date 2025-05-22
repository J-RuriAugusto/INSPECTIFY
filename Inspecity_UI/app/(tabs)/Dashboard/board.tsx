import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Button,StyleSheet, Image, TextInput, TouchableOpacity, Alert, FlatList, ScrollView, View, BackHandler, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import { Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { Text } from '@/components/Themed';
import useUserID from "../../useUserID";
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import HomeDetails from '../../../constants/HomeDetails'
import { Link } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../../../hooks/useTranslation';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Swipeable } from 'react-native-gesture-handler';
import axios from 'axios';


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
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const filteredReports = reportsTitleID.filter((report) => report.report_name.toLowerCase().includes(search.toLowerCase()));

  const handleRename = (reportId: string, newName: string) => {
    // Example: update the report name locally
    setReportsTitleID(prev =>
      prev.map(r =>
        r.report_id === reportId ? { ...r, report_name: newName } : r
      )
    );
    // TODO: Optionally, add API call to persist the change
  };

  const onRenameReport = (report: Reports) => {
    setSelectedReportId(report.report_id);
    setNewReportName(report.report_name);
    setRenameModalVisible(true);
  };

  const handleRenameSubmit = async () => {
    if (!newReportName.trim() || selectedReportId === null) return;

    try {
      await axios.put(`${API_BASE_URL}/api/update-report/${selectedReportId}`, {
        report_name: newReportName,
      });
      setRenameModalVisible(false);
      fetchReports(); // Refresh data
    } catch (error) {
      console.error('Failed to rename report:', error);
    }
  };

  // Swipe action component
  const renderRightActions = (onEdit: () => void) => (
    <TouchableOpacity
      onPress={onEdit}
      style={{
        backgroundColor: '#2563eb', // Tailwind blue-600
        justifyContent: 'center',
        alignItems: 'center',
        width: wp('18%'),
        borderRadius: 16,
        height: wp('14%')
      }}
    >
      <Text style={{ color: 'white', fontSize: 13, textAlign: 'center', fontFamily:'Epilogue-Bold' }}>{t('EDIT')}</Text>
    </TouchableOpacity>
  );

  // const [fontsLoaded] = useFonts({
  //   'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
  //   'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
  //   'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
  // });

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
  
  
  // if (!fontsLoaded) {
  //   return null; 
  // }

  // Inside your Dashboard component
  const [savedShops, setSavedShops] = useState<{ id: string; name: string; image: string }[]>([]);

  // Load saved bookmarks from AsyncStorage on focus
  useFocusEffect(
    useCallback(() => {
      const loadBookmarkedShops = async () => {
        try {
          const saved = await AsyncStorage.getItem('savedShops');
          const parsed = saved ? JSON.parse(saved) : [];
          setSavedShops(parsed);
        } catch (error) {
          console.error('Failed to load saved shops:', error);
        }
      };
      loadBookmarkedShops();
    }, [])
  );

  // When a shop is tapped, navigate to the map and pass the shop ID
  const handleShopPress = (id: string) => {
    router.push({
      pathname: '/(tabs)/Shops', // make sure your Shops.tsx is routed here
      params: { shopId: id },
    });
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

          <Link href="/(tabs)/Dashboard/settings" asChild>
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
        {savedShops.length > 0 ? (
          <FlatList
            data={savedShops}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleShopPress(item.id)}
                style={{
                  backgroundColor: '#0B417D',
                  padding: wp(3),
                  borderRadius: wp(3),
                  marginHorizontal: wp(1.5),
                  marginTop: hp(0.5),
                  marginBottom: hp(3),
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: wp(40),
                  height: hp(12),
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: hp(0.25) },
                  shadowOpacity: 0.1,
                  shadowRadius: wp(1),
                  elevation: 3,
                }}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: hp(0.25),
                    }}
                  >
                    <Text
                      numberOfLines={3}
                      style={{ fontSize: wp(3.5), fontWeight: 'bold', color: '#fff', flex: 1 }}
                    >
                      {item.name}
                    </Text>
                    <View
                      style={{
                        width: wp(7),
                        height: wp(7),
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <MaterialIcons name="favorite" size={22} color="#FF4D4D" />
                    </View>
                  </View>
                  <Text style={{ fontSize: wp(3), color: '#fff' }}>Tap to view on Shops</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: hp(2),
              paddingHorizontal: wp(5),
            }}
          >
            <MaterialIcons name="bookmark-border" size={48} color="#ccc" />
            <Text
              style={{
                fontSize: wp('3.9%'),
                fontWeight: '600',
                fontFamily: 'Archivo-Bold',
                color: '#777',
                marginTop: hp(1),
                textAlign: 'center',
              }}
            >
              {t('YOU_HAVENT_BOOKMARKED_ANY_SHOPS_YET')}
            </Text>
            <Text
              style={{
                fontSize: wp('3.5%'),
                fontFamily: 'Archivo-Regular',
                color: '#AFAFAF',
                // marginTop: hp(0.5),
                textAlign: 'center',
              }}
            >
              {t('GO_TO_THE_SHOPS_AND_TAP_THE_HEART_ICON_ON_A_STORE_TO_SAVE_IT_HERE')}
            </Text>
          </View>
        )}

        {/* Reports Section (Vertical Scroll) */}
        <Text style={styles.title4}>{t('REPORTS')}</Text>
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <ScrollView contentContainerStyle={[styles.reportsContainer, { flexGrow: 1 }]}
>
            {filteredReports.length === 0 ? (
              <View style={styles.noReportsContainer}>
                <Image
                  source={
                    reportsTitleID.length === 0
                      ? require('../../../assets/images/add_report.png')
                      : require('../../../assets/images/no_result.png')
                  }
                  style={styles.noReportsImage}
                  resizeMode="contain"
                />
                <Text style={styles.noReportsText}>
                  {reportsTitleID.length === 0
                    ? t('NO_REPORTS')
                    : t('NO_MATCHING_RESULTS')}
                </Text>
                <Text style={styles.noReportsSubtext}>
                  {reportsTitleID.length === 0
                    ? t('ADD_A_REPORT_BY_SCANNING')
                    : t('CHECK_SPELLING_OR_TRY_AGAIN')}
                </Text>
              </View>
            ) : (
              filteredReports.map((report) => (
                <View key={report.report_id} style={{ width: '100%', alignItems: 'center', }}>
                  <Swipeable
                    renderRightActions={() =>
                      renderRightActions(() => onRenameReport(report))
                    }
                    containerStyle={{ width: '100%', }}
                  >
                  <TouchableOpacity
                    onPress={() => handleReportPress(report.report_id)}
                    style={[styles.reportItem, { width: '97%', marginLeft: 5, }]}
                  >
                    <View style={styles.reportContent}>
                      <Image
                        source={require('../../../assets/images/report_icon.png')}
                        style={styles.reportIcon}
                      />
                      <Text style={styles.reportText}>
                        {report.report_name || t('UNTITLED')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  </Swipeable>
                </View>
              )))}
          </ScrollView>
        </View>
      </View>
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#000000', textAlign:'center' }}>Rename Report</Text>
            <TextInput
              value={newReportName}
              onChangeText={setNewReportName}
              style={{
                borderColor: '#ccc',
                borderWidth: 1,
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => setRenameModalVisible(false)}
                style={{
                  marginRight: 10,
                  backgroundColor: '#E55050', // red
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleRenameSubmit}
                style={{
                  backgroundColor: '#2196f3', // blue
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: wp('8.5%'),
    height: wp('8.5%'),
  },
  title1: {
    fontSize: wp('6.5%'),
    color: '#05173F',
    fontFamily: 'Epilogue-Black',
    alignSelf: 'center',
    textAlign: 'center',
  },
  title2: {
    fontSize: wp('4.5%'),
    color: '#AFAFAF',
    fontFamily: 'Archivo-Regular',
    marginBottom: hp('1%'),
    alignSelf: 'center',
    textAlign: 'center',
  },
  title3: {
    fontSize: wp('4.8%'),
    color: '#071C34',
    fontFamily: 'Epilogue-Bold',
    alignSelf: 'flex-start',
    marginTop: hp('1.5%'),
    marginBottom: hp('1.5%'),
    textAlign: 'left',
  },
  title4: {
    fontSize: wp('4.8%'),
    color: '#071C34',
    fontFamily: 'Epilogue-Bold',
    alignSelf: 'flex-start',
    marginBottom: hp('1.5%'),
    textAlign: 'left',
  },
  searchBar: {
    height: hp('5.5%'),
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: wp('6%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: wp('3%'),
    fontSize: wp('4%'),
    color: '#C0C0C0',
    backgroundColor: '#FFFFFF',
    textAlign: 'left',
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
    paddingBottom: hp('12%'),
  },

  reportsContainer: {
    width: '100%',
    paddingBottom: hp('35%'),
    alignItems: 'center',
  },
  reportItem: {
    padding: wp('4%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    marginBottom: hp('1.2%'),
    width: '98%',
    alignContent:'center',
    // borderWidth: 1,
    // borderColor: '#ddd',
    paddingHorizontal: wp('5%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,

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
    textAlign: 'left',
  },
  noReportsImage: {
    width: wp('12%'),
    height: wp('12%'),
    marginBottom: 10,
    opacity: 0.5,
  },

  noReportsText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    fontFamily: 'Archivo-Bold',
    color: '#777',
    marginTop: hp(1),
    textAlign: 'center',
  },

  noReportsSubtext: {
    fontSize: wp('3.8%'),
    fontFamily: 'Archivo-Regular',
    color: '#AFAFAF',
    // marginTop: hp(0.5),
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    marginRight: 10,
    color: 'red',
    fontWeight: 'bold',
  },
  confirmButton: {
    color: 'green',
    fontWeight: 'bold',
  },
});
                
export default Dashboard;
