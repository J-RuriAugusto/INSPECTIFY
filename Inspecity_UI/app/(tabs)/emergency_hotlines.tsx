import * as React from 'react';
import { View, Text, Image, useWindowDimensions, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Linking } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import * as Location from 'expo-location';
import { useFonts } from 'expo-font';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

export default function EmergencyHotlines() {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'favorites', title: 'Favorites' },
    { key: 'all', title: 'All' },
  ]);

  const [subIndex, setSubIndex] = React.useState(0);
  const [subRoutes] = React.useState([
    { key: '911', title: '911' },
    { key: 'disaster', title: 'Disaster Response' },
    { key: 'medical', title: 'Medical Services' },
    { key: 'police', title: 'Police Hotlines' },
  ]);

  const [location, setLocation] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [hotlines, setHotlines] = React.useState([]);
  const [favorites, setFavorites] = React.useState([]);

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../assets/fonts/Epilogue-Bold.ttf'),
  });
  if (!fontsLoaded) return null;

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get nearby hotlines.');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      fetchHotlines(loc);
    })();
  }, []);

  const fetchHotlines = (loc) => {
    const hotlineList = [
      { id: '1', name: '911 General Emergency', phone: '911', category: '911', icon: <Ionicons name="alert-circle" size={24} color="#071C34" /> },
      { id: '2', name: 'Disaster Hotline', phone: '123-456-7891', category: 'disaster', icon: <FontAwesome5 name="water" size={24} color="#071C34" /> },
      { id: '3', name: 'Medical Emergency', phone: '123-456-7892', category: 'medical', icon: <MaterialIcons name="local-hospital" size={24} color="#071C34" /> },
      { id: '4', name: 'Police Emergency', phone: '123-456-7893', category: 'police', icon: <FontAwesome5 name="shield-alt" size={24} color="#071C34" /> },
    ];
    setHotlines(hotlineList);
    setLoading(false);
  };

  const toggleFavorite = (item) => {
    const isFavorite = favorites.some((fav) => fav.id === item.id);
    if (isFavorite) {
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== item.id));
    } else {
      setFavorites((prevFavorites) => [...prevFavorites, item]);
    }
  };

  const renderItem = ({ item }) => {
    const isFavorite = favorites.some((fav) => fav.id === item.id);

    const renderLeftActions = () => (
      <TouchableOpacity style={styles.leftAction} onPress={() => Linking.openURL(`sms:${item.phone}`)}>
        <Image source={require('../../assets/images/message_icon.png')} style={styles.icon} />
      </TouchableOpacity>
    );

    const renderRightActions = () => (
      <TouchableOpacity style={styles.rightAction} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
        <Image source={require('../../assets/images/call_icon.png')} style={styles.icon} />
      </TouchableOpacity>
    );

    return (
      <Swipeable renderLeftActions={renderLeftActions} renderRightActions={renderRightActions}>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>{item.icon}</View>
            <View style={styles.detailsContainer}>
              <Text style={styles.hotlineName}>{item.name}</Text>
              <Text style={styles.hotlinePhone}>{item.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleFavorite(item)}>
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? 'red' : '#071C34'} />
            </TouchableOpacity>
          </View>
        </View>
      </Swipeable>
    );
  };

  const FavoritesRoute = () => (
    <View style={styles.allContainer}>
      {favorites.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, fontFamily: 'Epilogue-Regular', color: '#071C34' }}>
          No favorites yet. Add hotlines by tapping the heart icon.
        </Text>
      ) : (
        <FlatList data={favorites} keyExtractor={(item) => item.id} renderItem={renderItem} />
      )}
    </View>
  );

  // Sub-category Routes
  // const CategoryRoute = (categoryKey) => () => (
  //   <View style={styles.allContainer}>
  //     {loading ? <ActivityIndicator size="large" color="#0A4D95" /> :
  //       <FlatList
  //         data={hotlines.filter((item) => item.category === categoryKey)}
  //         keyExtractor={(item) => item.id}
  //         renderItem={renderItem}
  //       />}
  //   </View>
  // );

  const AllRoute = () => (
    <View style={{ flex: 1 }}>
      {/* Sub-category buttons */}
      <View style={styles.subCategoryContainer}>
        {subRoutes.map((route, idx) => (
          <TouchableOpacity
            key={route.key}
            style={[
              styles.subCategoryButton,
              subIndex === idx && styles.subCategoryButtonActive,
            ]}
            onPress={() => setSubIndex(idx)}
          >
            <Text
              style={[
                styles.subCategoryText,
                subIndex === idx && styles.subCategoryTextActive,
              ]}
            >
              {route.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
  
      {/* Hotline List */}
      <View style={styles.allContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0A4D95" />
        ) : (
          <FlatList
            data={hotlines.filter(
              (item) => item.category === subRoutes[subIndex].key
            )}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        )}
      </View>
    </View>
  );  

  return (
    <View style={{ flex: 1, paddingTop: 70, backgroundColor: '#fff' }}>
      <Text style={styles.title}>Emergency Hotlines</Text>
      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap({
          favorites: FavoritesRoute,
          all: AllRoute,
        })}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.indicator}
            style={styles.tabBar}
            tabStyle={styles.tabStyle}
            labelStyle={styles.label}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  subCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  
  subCategoryButton: {
    flex: 1,
    alignItems: 'center',
    // paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  
  subCategoryButtonActive: {
    backgroundColor: '#004A8E',
  },
  
  subCategoryText: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Epilogue-Regular',
    textAlign: 'center'
  },
  
  subCategoryTextActive: {
    color: '#fff',
    fontFamily: 'Epilogue-Bold',
  },  
  title: { fontSize: 20, color: '#071C34', fontFamily: 'Epilogue-Bold', textAlign: 'center', marginBottom: 5 },
  indicator: { backgroundColor: '#004A8E', height: '100%', borderRadius: 25 },
  tabBar: { backgroundColor: '#E0E0E0', borderRadius: 25, marginHorizontal: 60, marginBottom: 10, height: 45 },
  tabStyle: { justifyContent: 'center' },
  allContainer: { flex: 1, paddingHorizontal: 25, paddingTop: 10 },
  // label: {
  //   color: '#000',
  //   fontFamily: 'Epilogue-Regular',
  //   fontSize: 10,
  //   textAlign: 'center',
  //   marginBottom: 5
  // },
  card: {
    backgroundColor: '#fff',
    borderColor: '#000',
    padding: 30,
    marginBottom: 15,
    marginHorizontal: 3,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1,
  },
  hotlineName: {
    fontSize: 16,
    fontFamily: 'Epilogue-Bold',
    color: '#071C34',
    marginBottom: 2,
  },
  hotlinePhone: {
    fontSize: 14,
    fontFamily: 'Epilogue-Regular',
    color: '#071C34',
  },
  leftAction: {
    backgroundColor: '#2A74C7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    marginHorizontal: 3,
    borderRadius: 25,
    flexDirection: 'row',
    gap: 10,
  },
  rightAction: {
    backgroundColor: '#05173F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    marginHorizontal: 3,
    borderRadius: 25,
    flexDirection: 'row',
    gap: 10,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});
