import React, { useRef, useState, useEffect } from "react";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Pressable, Image, Linking, Animated } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const GOOGLE_MAPS_API_KEY = "AlzaSy-i3QEpxWHOlSbKGuJcuqKzB5OB0ejLe_E";

type Store = {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  image: string;
  rating: number;
  address: string;
  phone?: string;
  openingHours?: string[];
  distance?: number; // Added for distance calculations
};

const NearbyShops = () => {
  const mapRef = useRef<MapView>(null);
  const [selectedCard, setSelectedCard] = useState<string>("");
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const filterAnimation = useRef(new Animated.Value(0)).current;  
  const [ratingFilter, setRatingFilter] = useState(0);
  const [distanceFilter, setDistanceFilter] = useState(2000); // Default 2km
  
  // Track if filters have been applied
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // BOOKMARK FEATURE - New state variables
  const [bookmarkedStores, setBookmarkedStores] = useState<string[]>([]);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);

  // Load bookmarked stores from AsyncStorage on component mount
  useEffect(() => {
    loadBookmarkedStores();
  }, []);

  // Load bookmarked stores from AsyncStorage
  const loadBookmarkedStores = async () => {
    try {
      const savedBookmarks = await AsyncStorage.getItem('bookmarkedStores');
      if (savedBookmarks) {
        setBookmarkedStores(JSON.parse(savedBookmarks));
      }
    } catch (error) {
      console.error('Error loading bookmarked stores:', error);
    }
  };

  // Save bookmarked stores to AsyncStorage
  const saveBookmarkedStores = async (bookmarks: string[]) => {
    try {
      await AsyncStorage.setItem('bookmarkedStores', JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarked stores:', error);
    }
  };

  // Toggle bookmark for a store
  const toggleBookmark = (storeId: string) => {
    let updatedBookmarks: string[];
    
    if (bookmarkedStores.includes(storeId)) {
      // Remove bookmark
      updatedBookmarks = bookmarkedStores.filter(id => id !== storeId);
    } else {
      // Add bookmark
      updatedBookmarks = [...bookmarkedStores, storeId];
    }
    
    setBookmarkedStores(updatedBookmarks);
    saveBookmarkedStores(updatedBookmarks);
  };

  // Check if a store is bookmarked
  const isBookmarked = (storeId: string) => {
    return bookmarkedStores.includes(storeId);
  };

  // Toggle showing only bookmarked stores
  const toggleShowOnlyBookmarked = () => {
    setShowOnlyBookmarked(!showOnlyBookmarked);
  };

  // Get User Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      fetchNearbyStores(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  // Fetch Nearby Stores from Google Places API
  const fetchNearbyStores = async (latitude: number, longitude: number) => {
    const radius = 5000; // 5km max radius for API
    const type = "hardware_store|home_goods_store|general_contractor|electrician|plumber|roofing_contractor|painter|locksmith|carpenter|landscaper|hvac_contractor";
    const url = `https://maps.gomaps.pro/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const formattedStores = await Promise.all(
          data.results.map(async (place: any) => {
            // Fetch additional place details (like phone, opening hours, etc.)
            const detailsUrl = `https://maps.gomaps.pro/maps/api/place/details/json?place_id=${place.place_id}&key=${GOOGLE_MAPS_API_KEY}`;
            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();

            // Calculate distance from user
            const distance = calculateDistance(
              latitude,
              longitude,
              place.geometry.location.lat,
              place.geometry.location.lng
            );

            return {
              id: place.place_id,
              name: place.name,
              coordinates: {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              },
              image:
                place.photos && place.photos.length > 0
                  ? `https://maps.gomaps.pro/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
                  : "https://via.placeholder.com/400",
              rating: place.rating || 0,
              address: place.vicinity || "No address available",
              phone: detailsData.result.formatted_phone_number || "No phone available",
              openingHours:
                detailsData.result.opening_hours?.weekday_text || ["No hours available"],
              distance: distance, // Store the distance
            };
          })
        );

        // Sort by distance automatically - this happens by default, without filtering
        formattedStores.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setStores(formattedStores);
      } else {
        console.error("Error fetching places:", data.status);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  // Apply Filters
  const applyFilters = () => {
    if (!userLocation) return;
    
    // Get current user coordinates
    const userLat = userLocation.latitude;
    const userLng = userLocation.longitude;
    
    let filteredResults = [...stores]; // Start with all stores
    
    // Apply rating filter if set
    if (ratingFilter > 0) {
      filteredResults = filteredResults.filter(store => store.rating >= ratingFilter);
    }
    
    // Apply distance filter
    filteredResults = filteredResults.filter(store => 
      store.distance && store.distance <= distanceFilter
    );
    
    // Sort by distance
    filteredResults.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    // Update stores with filtered results
    setStores(filteredResults);
    setFiltersApplied(true);
    
    // Close filter panel
    toggleFilter();
    
    // Update map to show all filtered stores if there are any
    if (filteredResults.length > 0) {
      fitMapToStores(filteredResults);
    }
  };

  // Fit map to show all filtered stores
  const fitMapToStores = (stores: Store[]) => {
    if (stores.length === 0 || !mapRef.current) return;

    if (stores.length === 1) {
      // If only one store, center on it
      mapRef.current.animateToRegion({
        latitude: stores[0].coordinates.latitude,
        longitude: stores[0].coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      return;
    }

    // Calculate bounds for all stores
    let minLat = stores[0].coordinates.latitude;
    let maxLat = stores[0].coordinates.latitude;
    let minLng = stores[0].coordinates.longitude;
    let maxLng = stores[0].coordinates.longitude;

    stores.forEach(store => {
      minLat = Math.min(minLat, store.coordinates.latitude);
      maxLat = Math.max(maxLat, store.coordinates.latitude);
      minLng = Math.min(minLng, store.coordinates.longitude);
      maxLng = Math.max(maxLng, store.coordinates.longitude);
    });

    // Add padding
    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;

    mapRef.current.animateToRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    });
  };

  // Open Google Maps for Directions
  const openGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://maps.gomaps.pro/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  // Toggle Filter Panel
  const toggleFilter = () => {
    if (filterVisible) {
      Animated.timing(filterAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setFilterVisible(false)); // Hide after animation completes
    } else {
      setFilterVisible(true); // Show before animation starts
      Animated.timing(filterAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };  

  // Reset Filters and fetch original nearby stores
  const resetFilters = async () => {
    setRatingFilter(0);
    setDistanceFilter(2000);
    setFiltersApplied(false);
    setShowOnlyBookmarked(false);
    
    // Re-fetch original stores if user location is available
    if (userLocation) {
      fetchNearbyStores(userLocation.latitude, userLocation.longitude);
    }
    
    toggleFilter();
    
    // Reset map to user location
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Get filtered stores based on all criteria
  const getFilteredStores = () => {
    if (showOnlyBookmarked) {
      return stores.filter(store => bookmarkedStores.includes(store.id));
    }
    return stores;
  };

  // Stores to display based on filters and bookmarks
  const displayStores = getFilteredStores();

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        ref={mapRef}
        initialRegion={
          userLocation || {
            latitude: 37.7749,
            longitude: -122.4194,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }
        }
        showsUserLocation={true}
      >
        {displayStores.map((store) => (
          <Marker 
            key={store.id} 
            coordinate={store.coordinates}
            onPress={() => {
              setSelectedCard(store.name);
              mapRef.current?.animateToRegion(
                {
                  latitude: store.coordinates.latitude,
                  longitude: store.coordinates.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1000
              );
            }}
          >
            <View style={{ alignItems: "center" }}>
              {/* Custom Marker Icon */}
              <Image
                source={require("../../assets/images/store-icon.png")}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Bookmark Toggle Button */}
      <TouchableOpacity 
        style={[
          styles.bookmarkFilterButton, 
          showOnlyBookmarked && styles.bookmarkFilterButtonActive
        ]} 
        onPress={toggleShowOnlyBookmarked}
      >
        <Ionicons 
          name={showOnlyBookmarked ? "bookmark" : "bookmark-outline"} 
          size={24} 
          color={showOnlyBookmarked ? "#FFD700" : "white"} 
        />
      </TouchableOpacity>

      {/* Filter Button & Panel */}
      <View style={styles.filterWrapper}>
        {filterVisible && (
          /* Animated Filter Panel */
          <Animated.View
            style={[
              styles.filterContainer,
              { 
                opacity: filterAnimation, 
                transform: [{ scaleY: filterAnimation }]
              }
            ]}
          >
            {/* Star Rating Filter */}
            <View style={styles.ratingContainer}>
              <Text style={styles.label}>Rating:</Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity 
                  key={star} 
                  onPress={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                >
                  <Text style={[styles.star, ratingFilter >= star && styles.starSelected]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Distance Slider */}
            <View style={styles.sliderContainer}>
              <Text style={styles.label}>Distance:</Text>
              <Slider
                style={{ width: 100 }}
                minimumValue={500}
                maximumValue={20000}
                step={500}
                value={distanceFilter}
                onValueChange={(value) => setDistanceFilter(value)}
                minimumTrackTintColor="#1E90FF"
                maximumTrackTintColor="#D3D3D3"
              />
              <Text style={styles.distanceText}>{distanceFilter / 1000} km</Text>
            </View>

            {/* Filter Buttons */}
            <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.resetButton, 
                { opacity: filtersApplied ? 1 : 0.5 }
              ]}
              onPress={resetFilters}
              disabled={!filtersApplied}
            >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.searchButton} onPress={applyFilters}>
                <Text style={styles.searchButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Filter Button */}
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilter}>
          <Ionicons name="filter" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Store List at the Bottom */}
      <View style={styles.storeList}>
        {displayStores.length > 0 ? (
          <FlatList
            horizontal
            data={displayStores}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedCard(item.name);
                  mapRef.current?.animateToRegion(
                    {
                      latitude: item.coordinates.latitude,
                      longitude: item.coordinates.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    },
                    1000
                  );
                }}
                style={[
                  styles.card,
                  item.name === selectedCard && styles.activeCard,
                ]}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity 
                      onPress={() => toggleBookmark(item.id)}
                      style={styles.bookmarkButton}
                    >
                      {isBookmarked(item.id) ? (
                        <MaterialIcons name="favorite" size={22} color="#FF4D4D" />
                      ) : (
                        <MaterialIcons name="favorite-border" size={22} color="#999999" />
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.rating}>⭐ {item.rating || "No rating"}</Text>
                  <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
                  {item.distance && (
                    <Text style={styles.distance}>{(item.distance / 1000).toFixed(1)} km</Text>
                  )}
                </View>
              </Pressable>
            )}
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              {showOnlyBookmarked ? 
                "No bookmarked stores" : 
                filtersApplied ? 
                  "No stores match your filters" : 
                  "Looking for nearby stores..."}
            </Text>
          </View>
        )}
      </View>
      
      {/* Filter Status Indicator */}
      {(filtersApplied || showOnlyBookmarked) && (
        <View style={styles.filterStatusContainer}>
          <Text style={styles.filterStatusText}>
            {showOnlyBookmarked ? "Showing saved stores" : "Filters applied:"} 
            {ratingFilter > 0 ? ` ${ratingFilter}+ stars` : ''}
            {distanceFilter < 5000 ? ` within ${distanceFilter/1000}km.` : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },

  storeList: {
    position: 'absolute',
    bottom: hp(2.5),
    left: 0,
    right: 0,
    paddingVertical: hp(1.2),
  },

  card: {
    backgroundColor: '#fff',
    padding: wp(3),
    borderRadius: wp(3),
    marginHorizontal: wp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(70),
    height: hp(13),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.25) },
    shadowOpacity: 0.1,
    shadowRadius: wp(1),
    elevation: 3,
  },
  activeCard: { backgroundColor: '#E7E3AC' },

  image: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    marginRight: wp(2.5),
  },

  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.25),
  },

  name: { fontSize: wp(3.5), fontWeight: 'bold', color: '#333', flex: 1 },
  bookmarkButton: { width: wp(7), height: wp(7), justifyContent: 'center', alignItems: 'center' },
  rating: { fontSize: wp(3), color: '#555' },
  address: { fontSize: wp(3), color: '#777' },
  phone: { fontSize: wp(3), color: '#555', marginTop: hp(0.25) },
  distance: { fontSize: wp(3), color: '#0B417D', fontWeight: 'bold', marginTop: hp(0.25) },

  filterWrapper: {
    position: 'absolute',
    bottom: hp(17.5),
    right: wp(5),
    alignItems: 'flex-end',
  },

  filterButton: {
    position: 'absolute',
    top: -hp(5.5),
    right: -wp(2.5),
    backgroundColor: '#0B417D',
    padding: wp(2.5),
    borderRadius: wp(12.5),
    zIndex: 10,
  },

  bookmarkFilterButton: {
    position: 'absolute',
    top: hp(1),
    right: wp(15),
    backgroundColor: '#0B417D',
    padding: wp(2.5),
    borderRadius: wp(12.5),
    zIndex: 10,
  },
  bookmarkFilterButtonActive: { backgroundColor: '#0064C8' },

  filterContainer: {
    width: wp(58),
    backgroundColor: '#0B417D',
    borderRadius: wp(3),
    padding: wp(2.5),
    position: 'absolute',
    bottom: hp(6),
    overflow: 'hidden',
    zIndex: 10,
  },

  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(1.2) },
  label: { color: 'white', fontSize: wp(3.5), fontWeight: 'bold', marginRight: wp(1.2) },
  star: { fontSize: wp(5), color: 'white', marginRight: wp(2) },
  starSelected: { color: 'gold' },

  sliderContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(1.2) },
  distanceText: { color: 'white', fontSize: wp(3), marginLeft: wp(1.2), width: wp(10) },

  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: hp(0.5) },
  searchButton: {
    backgroundColor: '#4CAF50',
    padding: wp(2),
    borderRadius: wp(1.5),
    alignItems: 'center',
    flex: 1,
    marginLeft: wp(1.2),
  },
  searchButtonText: { color: 'white', fontWeight: 'bold' },

  resetButton: {
    backgroundColor: '#FF5252',
    padding: wp(2),
    borderRadius: wp(1.5),
    alignItems: 'center',
    flex: 1,
    marginRight: wp(1.2),
  },
  resetButtonText: { color: 'white', fontWeight: 'bold' },

  noResultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: wp(2.5),
    borderRadius: wp(3),
    alignItems: 'center',
    alignSelf: 'center',
  },
  noResultsText: { color: '#333', fontWeight: 'bold' },

  filterStatusContainer: {
    position: 'absolute',
    bottom: hp(17.5),
    left: wp(2.5),
    backgroundColor: 'rgba(11, 65, 125, 0.7)',
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(2.5),
    borderRadius: wp(5),
  },
  filterStatusText: { color: 'white', fontSize: wp(3), fontWeight: 'bold' },
});

export default NearbyShops;