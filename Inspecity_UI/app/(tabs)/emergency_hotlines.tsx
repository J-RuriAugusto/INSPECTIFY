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

  const [location, setLocation] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [hotlines, setHotlines] = React.useState([]);

  const [fontsLoaded] = useFonts({
    'Epilogue-Black': require('../../assets/fonts/Epilogue-Black.ttf'),
    'Archivo-Regular': require('../../assets/fonts/Archivo-Regular.ttf'),
    'Epilogue-Bold': require('../../assets/fonts/Epilogue-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return null; 
  }

  // Request location and fetch hotlines
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
      fetchHotlines(loc); // Mock fetching hotlines based on location
    })();
  }, []);

  // Mock function to fetch hotlines based on location
  const fetchHotlines = (loc) => {
    console.log('Fetching hotlines for:', loc.coords.latitude, loc.coords.longitude);

    // Example static list, replace with API call based on loc.coords
    const hotlineList = [
      { id: '1', name: 'Electric Emergency', phone: '123-456-7890', icon: <Ionicons name="flash" size={24} color="#071C34" /> },
      { id: '2', name: 'Police Emergency', phone: '987-654-3210', icon: <FontAwesome5 name="shield-alt" size={24} color="#071C34" /> },
      { id: '3', name: 'Fire Department', phone: '555-123-4567', icon: <MaterialIcons name="fire-extinguisher" size={24} color="#071C34" /> },
    ];

    setHotlines(hotlineList);
    setLoading(false);
  };

  const FavoritesRoute = () => (
    <View style={styles.scene}>
      <Text>Favorites Content Here (Saved Hotlines)</Text>
    </View>
  );

  // Render each hotline card with swipeable action
  const renderItem = ({ item }) => {
    // Left swipe (Message)
    const renderLeftActions = () => (
      <TouchableOpacity
        style={styles.leftAction}
        onPress={() => Linking.openURL(`sms:${item.phone}`)}
      >
        <Image
          source={require('../../assets/images/message_icon.png')} // Your custom message icon
          style={styles.icon}
        />
      </TouchableOpacity>
    );

    // Right swipe (Call)
    const renderRightActions = () => (
      <TouchableOpacity
        style={styles.rightAction}
        onPress={() => Linking.openURL(`tel:${item.phone}`)}
      >
        <Image
          source={require('../../assets/images/call_icon.png')} // Your custom call icon
          style={styles.icon}
        />
      </TouchableOpacity>
    );

    return (
      <Swipeable
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
      >
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>{item.icon}</View>
            <View style={styles.detailsContainer}>
              <Text style={styles.hotlineName}>{item.name}</Text>
              <Text style={styles.hotlinePhone}>{item.phone}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="heart-outline" size={24} color="#071C34" />
            </TouchableOpacity>
          </View>
        </View>
      </Swipeable>
    );
  };

  const AllRoute = () => (
    <View style={styles.allContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#0A4D95" />
      ) : (
        <FlatList
          data={hotlines}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );

  const renderScene = SceneMap({
    favorites: FavoritesRoute,
    all: AllRoute,
  });

  return (
    <View style={{ flex: 1, paddingTop: 70, backgroundColor: '#fff' }}>
      <Text style={styles.title}>Emergency Hotlines</Text>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.indicator}
            style={styles.tabBar}
            tabStyle={styles.tabStyle}
            renderLabel={({ route, focused }) => (
              <Text
                style={[
                  styles.label,
                  { color: focused ? '#000' : '#071C34' },
                ]}
              >
                {route.title}
              </Text>
            )}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    color: '#071C34',
    fontFamily: 'Epilogue-Bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  scene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  tabBar: {
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    marginHorizontal: 60,
    marginBottom: 10,
    height: 50,
    overflow: 'hidden',
  },
  indicator: {
    backgroundColor: '#0A4D95',
    height: '100%',
    borderRadius: 20,
  },
  tabStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    padding: 0,
    margin: 0,
  },
  label: {
    fontFamily: 'Epilogue-Regular',
    fontSize: 14,
    margin: 0,
    padding: 0,
    textAlign: 'center',
  },
  allContainer: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 10,
  },
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
  actionText: {
    color: '#fff',
    fontFamily: 'Epilogue-Bold',
    marginLeft: 10,
  },
  icon: {
    width: 50, // Adjust size based on your icon
    height: 50,
    resizeMode: 'contain',
  },
});
