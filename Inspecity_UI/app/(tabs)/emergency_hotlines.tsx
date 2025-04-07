import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, TouchableOpacity, Alert, Linking, StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import * as Location from 'expo-location';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from "react-native-gesture-handler";

const GOOGLE_API_KEY = "AlzaSysSIYHDroeAu3l1D7TZ2X3ZkJNiRQUsNBz"; // Replace with your actual API key

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
  
  const [apiHotlines, setApiHotlines] = useState([]);
  const [favorites, setFavorites] = useState(COMMON_HOTLINES);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [apiError, setApiError] = useState(null);

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
  const getIcon = useCallback((type) => {
    const iconType = EMERGENCY_TYPES.find(t => t.type === type) || EMERGENCY_TYPES[0];
    return <MaterialIcons name={iconType.icon} size={24} color={iconType.color} />;
  }, []);

  // Fetch place details including phone number
  const fetchPlaceDetails = useCallback(async (placeId) => {
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

  // Fetch nearby hotlines from Google Places API
  const fetchNearbyHotlines = useCallback(async (coords) => {
    const { latitude, longitude } = coords;
    const cacheKey = `apiHotlines-${latitude.toFixed(4)}-${longitude.toFixed(4)}`;

    try {
      // Check for cached data (valid for 1 hour)
      const cachedData = await AsyncStorage.getItem(cacheKey);
      const cachedTimestamp = await AsyncStorage.getItem(`${cacheKey}-timestamp`);
      
      if (cachedData && cachedTimestamp && (Date.now() - parseInt(cachedTimestamp) < 3600000)) {
        setApiHotlines(JSON.parse(cachedData));
        return;
      }

      setLoading(true);
      setApiError(null);

      // Process all emergency types in parallel
      const typeRequests = EMERGENCY_TYPES.map(async (emergencyType) => {
        try {
          // First fetch the place IDs
          const searchResponse = await fetch(
            `https://maps.gomaps.pro/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=${emergencyType.keyword}&key=${GOOGLE_API_KEY}`
          );
          const searchData = await searchResponse.json();
          
          if (searchData.status !== "OK" || !searchData.results?.length) return [];

          // Then fetch details for each place (limited to 3 per type for performance)
          const placeDetails = await Promise.all(
            searchData.results.slice(0, 3).map(place => fetchPlaceDetails(place.place_id))
          );

          return placeDetails.map((details, index) => ({
            id: searchData.results[index].place_id,
            name: details?.name || searchData.results[index].name,
            phone: details?.formatted_phone_number || "N/A",
            address: details?.vicinity || "Address not available",
            type: emergencyType.type,
          }));
        } catch (error) {
          console.error(`Error fetching ${emergencyType.keyword}:`, error);
          return [];
        }
      });

      const results = await Promise.all(typeRequests);
      const nearbyHotlines = results.flat().filter(Boolean);

      setApiHotlines(nearbyHotlines);
      
      // Cache the results with timestamp
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

    const initialize = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError("Location access needed for nearby services");
          return;
        }

        const location = await Location.getCurrentPositionAsync({ 
          accuracy: Location.Accuracy.High,
          timeout: 10000 
        });
        
        if (isMounted) {
          fetchNearbyHotlines(location.coords);
        }
      } catch (err) {
        if (isMounted) {
          setLocationError("Couldn't access your location");
          console.error("Location error:", err);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [fetchNearbyHotlines]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (hotline) => {
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
  const renderItem = useCallback(({ item, showFavorite = true }) => {
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="favorite-border" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No favorites added yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the heart icon on hotlines to save them here
            </Text>
          </View>
        }
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
              <Text style={styles.emptyText}>No emergency services found nearby</Text>
              <Text style={styles.emptySubtext}>
                Ensure location services are enabled and try again
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
        renderScene={SceneMap({
          favorites: FavoritesTab,
          all: AllTab,
        })}
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
    paddingTop: 50,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Epilogue-Bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#071C34',
  },
  tabBar: {
    backgroundColor: '#004A8E',
    elevation: 2,
    shadowOpacity: 0.1,
    marginHorizontal: 40,
    marginBottom: 10,
    borderRadius: 25,
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
    fontSize: 15,
  },
  tabContainer: {
    flex: 1,
  },
  leftAction: {
    backgroundColor: '#2A74C7',
    justifyContent: 'center',
    alignItems: 'center',
    // paddingHorizontal: 20,
    // marginBottom: 15,
    marginHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    // gap: 10,
  },
  rightAction: {
    backgroundColor: '#05173F',
    justifyContent: 'center',
    alignItems: 'center',
    // paddingHorizontal: 20,
    // marginBottom: 15,
    marginHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    // gap: 10,
  },
  icon: {
    width: '35%', // Adjust size based on your icon
    height: '35%',
    resizeMode: 'contain',
  }, 
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  phone: {
    fontSize: 16,
    color: '#0A4D95',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default EmergencyHotlines;