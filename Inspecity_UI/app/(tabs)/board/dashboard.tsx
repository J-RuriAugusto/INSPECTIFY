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
interface Report {
  report_id: string;
  report_name: string;
}

const Dashboard = () => {
  const [search, setSearch] = React.useState('');
  const userId = useUserID();
  const [houseName, setHouseName] = useState('NAME OF HOUSE');
  const [location, setLocation] = useState('LOCATION');
  const [reportsTitleID, setReportsTitleID] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const API_KEY = 'BT_1smAfCA4roEldR7S9LObSgdbZ7uGAF2HJvs5VQyY';
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
          "No Internet Connection",
          "Please check your internet connection and try again.",
          [
            { text: "OK", onPress: () => BackHandler.exitApp() }
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
      setHouseName(data.home_name && data.home_name.trim() ? data.home_name : "NAME OF HOUSE");
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
        setLocation("LOCATION");
      }
    } catch (error) {
      let errorMessage = "Backend is not accessible.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.log("Error fetching house details:", errorMessage);
      Alert.alert("Error fetching house details", errorMessage);
      setHouseName("NAME OF HOUSE");
      setLocation("LOCATION");
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
      Alert.alert("Error fetching report titles.");
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
    router.push({ pathname: '../assess structure/reportDetails', params: {report_id: id } });
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
          <Link href="./MyProperties" asChild>
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
          placeholder="Search here..."
          placeholderTextColor="#AFAFAF"
          value={search}
          onChangeText={setSearch}
        />

        {/* Saved Shops (Horizontal Scroll) */}
        <Text style={styles.title3}>Saved Shops</Text>
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
        <Text style={styles.title4}>Reports</Text>
                <View style={{ flex: 1, backgroundColor: 'FFFFFF' }}>
                  <ScrollView contentContainerStyle={styles.reportsContainer}>
                    {reportsTitleID.length === 0 ? (
                      <View style={styles.noReportsContainer}>
                        <Text style={styles.noReportsText}>No reports yet</Text>
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
                            <Text style={styles.reportText}>{report.report_name}</Text>
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
    paddingTop: 60, // Adjusted for the header height
    paddingHorizontal: 20,   
    width: '100%'   
  },
  header: {
    position: 'absolute', // Fix the header at the top
    paddingTop: 20, // Space for the top
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width,
    backgroundColor: '#FFFFFF', // Matches the screen background
  },
  headerIcon: {
    width: 30,
    height: 30,
  },
  title1: {
    fontSize: 25,
    color: '#05173F',
    fontFamily: 'Epilogue-Black',
    alignSelf: 'center'
  },
  title2: {
    fontSize: 17,
    color: '#AFAFAF',
    fontFamily: 'Archivo-Regular',
    marginBottom: 10,
    alignSelf: 'center'
  },
  title3: {
    fontSize: 18,
    color: '#071C34',
    fontFamily: 'Epilogue-Bold',
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 10,  
  },
  title4: {
    fontSize: 18,
    color: '#071C34',
    fontFamily: 'Epilogue-Bold',
    alignSelf: 'flex-start',  
    marginBottom: 10,  
  },
  searchBar: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  shopImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 60,
  },
  reportsContainer: {
    paddingBottom: 256, // Add some padding at the bottom to avoid cutoff
    width: '100%'
  },
  noReportsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noReportsText: {
    fontSize: 18,
    color: '#AFAFAF',
    fontFamily: 'Archivo-Regular',
  },
  reportItem: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 10,
    width: '100%',  // Makes the container match the search bar width
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 20, // Adjusted for consistency
    // alignSelf: 'stretch',
    flexDirection: 'row',  // Keep the icon and text in a row layout
    alignItems: 'center',   // Center the icon and text vertically
    justifyContent: 'flex-start'
  },
  reportContent: {
    flexDirection: 'row',  // Aligns icon and title horizontally
    alignItems: 'center',  // Centers them vertically
    justifyContent: 'flex-start',
    gap: 8
  },
  reportIcon: {
      width: 20,  // Smaller icon for minimal spacing
      height: 20,
      marginRight: 8,  // Minimal space between the icon and the title
  },
  reportText: {
      fontSize: 18,
      color: '#2B3C62',
      fontFamily: 'Epilogue-Bold',
      textAlign: 'left'
  }
});

export default Dashboard;
