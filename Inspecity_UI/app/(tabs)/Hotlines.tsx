import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, TouchableOpacity, Alert, Linking, StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const GOOGLE_API_KEY = "AlzaSy7HAPvtLO-EyLbipZQu4q-imLx4MU4mLCt"; // Replace with your actual API key

// Common emergency numbers (always available)
const COMMON_HOTLINES = [
  { id: '911', name: 'Emergency Hotline', phone: '911', type: 'emergency', isCommon: true },
  { id: '117', name: 'Police Hotline', phone: '117', type: 'police', isCommon: true },
  { id: '1669', name: 'Red Cross', phone: '1669', type: 'Red Cross', isCommon: true },
];

const EMERGENCY_TYPES = [
  { type: "hospital", keyword: "hospital", icon: "local-hospital", color: "red" },
  { type: "fire", keyword: "fire station", icon: "local-fire-department", color: "orange" },
  { type: "police", keyword: "police station", icon: "local-police", color: "blue" },
  { type: "redcross", keyword: "Red Cross", icon: "volunteer-activism", color: "red" },
  { type: "command", keyword: "Cebu City Command Center", icon: "support-agent", color: "purple" },
];

const EmergencyHotlines = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'favorites', title: 'Favorites' },
    { key: 'all', title: 'All' },
  ]);
  const [apiHotlines, setApiHotlines] = useState<Hotline[]>([]);
  const [favorites, setFavorites] = useState(COMMON_HOTLINES);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  type Hotline = {
    id: string;
    name: string;
    phone: string;
    address?: string;
    type: string;
    isCommon: boolean;
  };
  type Coordinates = {
    latitude: number;
    longitude: number;
  };
  type Place = {
    place_id: string;
    name?: string;
    vicinity?: string;
  };

  // Load user's saved favorites on startup
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('userFavorites');
        if (savedFavorites) {
          setFavorites([...COMMON_HOTLINES, ...JSON.parse(savedFavorites)]);
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };
    loadFavorites();
  }, []);

  // Get icon component based on type
  const getIcon = useCallback((type: string) => {
    const iconType = EMERGENCY_TYPES.find(t => t.type === type) || EMERGENCY_TYPES[0];
    return (
      <MaterialIcons
        name={iconType.icon as keyof typeof MaterialIcons.glyphMap}
        size={24}
        color={iconType.color}
      />
    );
  }, []);  

  // Fetch place details including phone number
  const fetchPlaceDetails = useCallback(async (placeId: string) => {
    try {
      const response = await fetch(
        `https://maps.gomaps.pro/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_phone_number,vicinity&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      return data.status === "OK" ? data.result : null;
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  }, []);
  
  const fetchNearbyHotlines = useCallback(async (coords: Coordinates) => {
    const { latitude, longitude } = coords;
    const cacheKey = `apiHotlines-${latitude.toFixed(4)}-${longitude.toFixed(4)}`;
  
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      const cachedTimestamp = await AsyncStorage.getItem(`${cacheKey}-timestamp`);
  
      if (cachedData && cachedTimestamp && (Date.now() - parseInt(cachedTimestamp) < 3600000)) {
        setApiHotlines(JSON.parse(cachedData));
        return;
      }
  
      setLoading(true);
      setApiError(null);
  
      const typeRequests = EMERGENCY_TYPES.map(async (emergencyType) => {
        try {
          const searchResponse = await fetch(
            `https://maps.gomaps.pro/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=${emergencyType.keyword}&key=${GOOGLE_API_KEY}`
          );
          const searchData = await searchResponse.json();
  
          if (searchData.status !== "OK" || !searchData.results?.length) return [];
  
          const placeDetails = await Promise.all(
            searchData.results.slice(0, 3).map((place: Place) => fetchPlaceDetails(place.place_id))
          );
  
          return placeDetails.map((details, index) => ({
            id: searchData.results[index].place_id,
            name: details?.name || searchData.results[index].name,
            phone: details?.formatted_phone_number || "N/A",
            address: details?.vicinity || "Address not available",
            type: emergencyType.type,
            isCommon: false,
          }));
        } catch (error) {
          console.error(`Error fetching ${emergencyType.keyword}:`, error);
          return [];
        }
      });
  
      const results = await Promise.all(typeRequests);
      const nearbyHotlines = results.flat().filter(Boolean);
  
      setApiHotlines(nearbyHotlines);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(nearbyHotlines));
      await AsyncStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString());
    } catch (error) {
      console.error("Failed to fetch nearby services:", error);
      setApiError("Couldn't load nearby services. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [fetchPlaceDetails]);  

  // Request location permission and fetch data
  useEffect(() => {
    let isMounted = true;

    async function getLocationWithTimeout(timeoutMs: number) {
      const locPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const timeoutPromise = new Promise<Location.LocationObject>((_, reject) =>
        setTimeout(() => reject(new Error('Location request timed out')), timeoutMs)
      );

      return Promise.race([locPromise, timeoutPromise]);
    }

    const initialize = async () => {
      let attempts = 0;
      const maxAttempts = 3;
      let success = false;
    
      while (attempts < maxAttempts && !success) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setLocationError("Location access needed for nearby services");
            return;
          }
    
          const location = await getLocationWithTimeout(10_000);
          fetchNearbyHotlines(location.coords);
          success = true;
        } catch (err: any) {
          attempts++;
          if (attempts >= maxAttempts) {
            if (err.message === 'Location request timed out') {
              setLocationError("Location request took too long. Please try again.");
            } else {
              setLocationError("Couldn't access your location");
            }
            console.error("Location error:", err);
          }
        }
      }
    };    

    initialize();

    return () => {
      isMounted = false;
    };
  }, [fetchNearbyHotlines]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (hotline: Hotline) => {
    if (hotline.isCommon) return; // Common hotlines cannot be unfavorited

    setFavorites(prev => {
      const isFavorite = prev.some(item => item.id === hotline.id);
      let newFavorites;

      if (isFavorite) {
        newFavorites = prev.filter(item => item.id !== hotline.id);
      } else {
        newFavorites = [...prev, hotline];
      }

      // Save only user-added favorites (excluding common ones)
      const userFavorites = newFavorites.filter(item => !item.isCommon);
      AsyncStorage.setItem('userFavorites', JSON.stringify(userFavorites));

      return newFavorites;
    });
  }, []);

  // Render individual hotline item
  const renderItem = useCallback(
    ({
      item,
      showFavorite = true,
    }: {
      item: Hotline;
      showFavorite?: boolean;
    }) => {
    const isFavorite = favorites.some(fav => fav.id === item.id);
  
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (item.phone !== "N/A") {
            Alert.alert(
              "Contact Hotline",
              `How would you like to contact ${item.name}?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Message",
                  onPress: () => Linking.openURL(`sms:${item.phone}`),
                },
                {
                  text: "Call",
                  onPress: () => Linking.openURL(`tel:${item.phone}`),
                }
              ]
            );
          } else {
            Alert.alert(
              item.isCommon ? "Standard Emergency Number" : "Service Information",
              item.isCommon
                ? "This is a standard emergency number for your area."
                : "Phone number not available. Please visit the location for assistance."
            );
          }
        }}        
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {getIcon(item.type)}
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name}</Text>
            {item.address && <Text style={styles.address}>{item.address}</Text>}
            <Text style={styles.phone}>📞 {item.phone}</Text>
          </View>
          {showFavorite && (
            <TouchableOpacity 
              onPress={() => toggleFavorite(item)}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <MaterialIcons 
                name={isFavorite ? "favorite" : "favorite-border"} 
                size={24} 
                color={isFavorite ? "red" : "#ccc"} 
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [favorites, getIcon, toggleFavorite]);

  // Tab Screens
  const FavoritesTab = () => (
    <View style={styles.tabContainer}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderItem({ 
          item, 
          showFavorite: !item.isCommon
        })}
        // ListEmptyComponent={
        //   <View style={styles.emptyState}>
        //     <MaterialIcons name="favorite-border" size={48} color="#ccc" />
        //     <Text style={styles.emptyText}>No favorites added yet</Text>
        //     <Text style={styles.emptySubtext}>
        //       Tap the heart icon on hotlines to save them here
        //     </Text>
        //   </View>
        // }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );

  const AllTab = () => (
    <View style={styles.tabContainer}>
      {locationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      )}
      
      {apiError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{apiError}</Text>
        </View>
      )}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A4D95" />
          <Text style={styles.loadingText}>Finding nearby emergency services...</Text>
        </View>
      ) : (
        <FlatList
          data={apiHotlines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderItem({ item })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="location-off" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No emergency services found nearby.</Text>
              <Text style={styles.emptySubtext}>
                Ensure location services are enabled and try again.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );

  const renderScene = SceneMap({
    favorites: FavoritesTab,
    all: AllTab,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Hotlines</Text>
      <TabView
        navigationState={{ index, routes }}
        // renderScene={SceneMap({
        //   favorites: FavoritesTab,
        //   all: AllTab,
        // })}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={styles.indicator}
            style={styles.tabBar}
            labelStyle={styles.label}
            pressColor="#f0f0f0"
          />
        )}
        lazy
        lazyPreloadDistance={1}
        // initialLayout={{ width: 100 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(5),
    backgroundColor: '#f8f9fa',
  },

  title: {
    fontSize: wp(6),
    fontFamily: 'Epilogue-Bold',
    textAlign: 'center',
    marginBottom: hp(2),
    color: '#071C34',
  },

  tabBar: {
    backgroundColor: '#004A8E',
    elevation: 2,
    shadowOpacity: 0.1,
    marginHorizontal: wp(10),
    marginBottom: hp(1),
    borderRadius: wp(12),
    overflow: 'hidden',
  },

  indicator: {
    backgroundColor: '#00A8E8',
    height: '100%',
  },

  label: {
    color: '#071C34',
    fontFamily: 'Epilogue-Regular',
    textTransform: 'none',
    fontSize: wp(4),
  },

  tabContainer: {
    flex: 1,
  },

  // icon: {
  //   width: wp(8),
  //   height: wp(8),
  //   resizeMode: 'contain',
  // },

  card: {
    backgroundColor: '#fff',
    padding: wp(4),
    marginHorizontal: wp('5%'),
    marginVertical: hp(1),
    borderRadius: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.2) },
    shadowOpacity: 0.1,
    shadowRadius: wp(1),
    elevation: 2,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  textContainer: {
    flex: 1,
    marginLeft: wp(4),
  },

  name: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#333',
  },

  address: {
    fontSize: wp(3.5),
    color: '#666',
    marginVertical: hp(0.5),
  },

  phone: {
    fontSize: wp(4),
    color: '#0A4D95',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: hp(1),
    color: '#666',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(8),
  },

  emptyText: {
    fontSize: wp(6),
    fontFamily: 'Epilogue-Bold',
    color: '#4682B4',
    marginTop: hp(2),
    textAlign: 'center',
  },

  emptySubtext: {
    fontSize: wp(4.5),
    color: '#4682B4',
    textAlign: 'center',
    marginTop: hp(0.5),
    marginBottom: hp(2),
    lineHeight: hp(3),
    fontFamily: 'Epilogue-Regular',
  },

  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: wp(3),
    borderRadius: wp(2),
    marginHorizontal: wp(5),
    marginBottom: hp(1),
  },

  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
  },

  listContent: {
    paddingBottom: hp(3),
  },
});

export default EmergencyHotlines;