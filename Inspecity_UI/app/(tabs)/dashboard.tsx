import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Image, TextInput, TouchableOpacity, Alert, FlatList, ScrollView, View, BackHandler } from 'react-native';
import { Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { Text } from '@/components/Themed';
import useUserID from "../useUserID";
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';

const Dashboard = () => {
  const [search, setSearch] = React.useState('');
  const userId = useUserID();
  const [houseName, setHouseName] = useState('NAME OF HOUSE');
  const [location, setLocation] = useState('LOCATION');
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../assets/fonts/Epilogue-Bold.ttf'),
  });

  useEffect(() => {
    if (userId) {
      fetchHouseDetails(userId);
    }
  }, [userId]);

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

  const fetchHouseDetails = async (userId: String) => {
    try {
      const response = await fetch(`http://172.16.0.137:5000/homeowners/${userId}/default_home`);
      const data = await response.json();
      if (data.homeName) {
        setHouseName(data.homeName);
      }
      if (data.latitude && data.longitude) {
        // Use reverse geocoding to get the address from latitude and longitude
        let reverseGeocode = await Location.reverseGeocodeAsync({ latitude: data.latitude, longitude: data.longitude });
  
        // Extract the relevant parts of the address
        if (reverseGeocode.length > 0) {
          const { city, district, region, country, street, name } = reverseGeocode[0];
  
          // Format the address as Baranggay, Municipality/District, Province/City
          const formattedLocation = `${city || district || ''}, ${region || ''}`;
          setLocation(formattedLocation.trim());
        } else {
          setLocation('Unable to fetch location');
        }
      }
    } catch (error) {
      console.error('Error fetching house details:', error);
    }
  };

  if (!fontsLoaded) {
    return null; 
  }

  const savedShops = [
    { id: '1', image: require('../../assets/images/shop1.png') },
    { id: '2', image: require('../../assets/images/shop2.png') },
    { id: '3', image: require('../../assets/images/shop2.png') },
    { id: '4', image: require('../../assets/images/shop2.png') },
  ];

  const reportsData = [
    { id: '1', title: 'Report 1' },
    { id: '2', title: 'Report 2' },
    { id: '3', title: 'Report 3' },
    { id: '4', title: 'Report 4' },
    { id: '5', title: 'Report 5' },
    { id: '6', title: 'Report 6' },
    { id: '7', title: 'Report 7' },
    { id: '8', title: 'Report 8' },
  ];

  const handleShopPress = (id: string) => {
    Alert.alert(`Shop ${id} Pressed!`);
  };

  const handleReportPress = (id: string) => {
    Alert.alert(`Report ${id} Pressed!`);
  };

  return (
    <View style={styles.container}>
      {/* Header with House and Settings Icons */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Alert.alert('House Icon Pressed!')}>
          <Image source={require('../../assets/images/houseicon.png')} style={styles.headerIcon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Alert.alert('Settings Icon Pressed!')}>
          <Image source={require('../../assets/images/settings_icon.png')} style={styles.headerIcon} />
        </TouchableOpacity>
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
    <ScrollView contentContainerStyle={styles.reportsContainer}>
      {reportsData.map((report) => (
        <TouchableOpacity 
          key={report.id} 
          onPress={() => handleReportPress(report.id)} 
          style={styles.reportItem}
        >
          <View style={styles.reportContent}>
            {/* Icon before the report title */}
            <Image 
              source={require('../../assets/images/report_icon.png')} 
              style={styles.reportIcon}
            />
            
            {/* Report Title */}
            <Text style={styles.reportText}>{report.title}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
    </View>
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
    paddingBottom: 10, // Add some padding at the bottom to avoid cutoff
    width: '100%'
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
