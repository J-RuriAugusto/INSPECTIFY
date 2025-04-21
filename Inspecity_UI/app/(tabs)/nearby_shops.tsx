import React, { useRef, useState, useEffect } from "react";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Pressable, Image, Linking, Animated} from "react-native";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";

const GOOGLE_MAPS_API_KEY = "AlzaSycMz978ghujEfEk1vWDNzF86fgwzsPrPmq";

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
        {stores.map((store) => (
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
          <Image source={require("../../assets/images/filter-icon.png")} style={{ width: 24, height: 24, tintColor: "white" }} />
        </TouchableOpacity>
      </View>

      {/* Store List at the Bottom */}
      <View style={styles.storeList}>
        {stores.length > 0 ? (
          <FlatList
            horizontal
            data={stores}
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
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
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
              {filtersApplied ? 
                "No stores match your filters" : 
                "Looking for nearby stores..."}
            </Text>
          </View>
        )}
      </View>
      
      {/* Filter Status Indicator (only shows when filters are applied) */}
      {filtersApplied && (
        <View style={styles.filterStatusContainer}>
          <Text style={styles.filterStatusText}>
            Filters applied: 
            {ratingFilter > 0 ? ` ${ratingFilter}+ stars` : ''}
            {distanceFilter < 5000 ? ` within ${distanceFilter/1000}km` : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  storeList: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    width: 280,
    height: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeCard: {
    backgroundColor: "#E7E3AC",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  cardContent: { flex: 1 },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  rating: {
    fontSize: 12,
    color: "#555",
  },
  address: {
    fontSize: 12,
    color: "#777",
  },
  phone: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  distance: {
    fontSize: 12,
    color: "#0B417D",
    fontWeight: "bold",
    marginTop: 2,
  },
  filterWrapper: {
    position: "absolute",
    bottom: '17.5%',
    right: '5%',
    alignItems: "flex-end",
  },
  filterButton: {
    position: "absolute",
    top: -45,
    right: '5%',
    backgroundColor: "#0B417D",
    padding: 10,
    borderRadius: 25,
    zIndex: 10,
  },
  filterContainer: {
    width: 230,
    backgroundColor: "#0B417D",
    borderRadius: 10,
    padding: 10,
    position: "absolute",
    bottom: 50,
    overflow: "hidden",
    zIndex: 10,
  },
  ratingContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  label: { color: "white", fontSize: 14, fontWeight: "bold", marginRight: 5 },
  star: { fontSize: 20, color: "white", marginRight: 8 },
  starSelected: { color: "gold" },
  sliderContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  distanceText: { color: "white", fontSize: 12, marginLeft: 5, width: 40 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  searchButton: { 
    backgroundColor: "#4CAF50", 
    padding: 8, 
    borderRadius: 5, 
    alignItems: "center", 
    flex: 1,
    marginLeft: 5,
  },
  searchButtonText: { color: "white", fontWeight: "bold" },
  resetButton: { 
    backgroundColor: "#FF5252", 
    padding: 8, 
    borderRadius: 5, 
    alignItems: "center", 
    flex: 1,
    marginRight: 5,
  },
  resetButtonText: { color: "white", fontWeight: "bold" },
  noResultsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
  },
  noResultsText: {
    color: "#333",
    fontWeight: "bold",
  },
  filterStatusContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(11, 65, 125, 0.7)",
    paddingVertical:.5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  filterStatusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default NearbyShops;