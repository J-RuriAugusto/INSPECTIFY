import React from 'react';
import { StyleSheet, Image, TextInput, TouchableOpacity, Alert, FlatList, ScrollView, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Link } from 'expo-router';
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const Dashboard = () => {
  const [search, setSearch] = React.useState('');
  
  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../../assets/fonts/Epilogue-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null; 
  }

  const savedShops = [
    { id: '1', image: require('../../../assets/images/shop1.png') },
    { id: '2', image: require('../../../assets/images/shop2.png') },
    { id: '3', image: require('../../../assets/images/shop2.png') },
    { id: '4', image: require('../../../assets/images/shop2.png') },
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
        <Link href="/Dashboard/MyProperties" asChild>
          <TouchableOpacity>
            <Image source={require('../../../assets/images/houseicon.png')} style={styles.headerIcon} />
          </TouchableOpacity>
        </Link>

        <Link href="/Dashboard/settings" asChild>
        <TouchableOpacity>            
          <Image source={require('../../../assets/images/settings_icon.png')} style={styles.headerIcon} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Main Content */}
      <Text style={styles.title1}>NAME OF HOUSE</Text>
      <Text style={styles.title2}>Location</Text>

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
              source={require('../../../assets/images/report_icon.png')} 
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
    paddingTop: hp('8%'),
    paddingHorizontal: wp('6%'),
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
  reportsContainer: {
    paddingBottom: hp('1.5%'),
    width: '100%',
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
