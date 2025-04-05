import React, { useRef, useState, useEffect } from "react";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Pressable, Image, Linking, Animated} from "react-native";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";

const GOOGLE_MAPS_API_KEY = "AlzaSySKDpdVHxLHHnDMCvPuNtR0Ckwpg1ZbaYf";

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
};

const NearbyShops = () => {
  const mapRef = useRef<MapView>(null);
  const [selectedCard, setSelectedCard] = useState<string>("");
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const filterAnimation = useRef(new Animated.Value(0)).current;  
  const [ratingFilter, setRatingFilter] = useState(0);
  const [distanceFilter, setDistanceFilter] = useState(0);

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

  // Fetch Nearby Stores from Google Places API
  const fetchNearbyStores = async (latitude: number, longitude: number) => {
    const radius = 2000;
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
              rating: place.rating || "No rating",
              address: place.vicinity || "No address available",
              phone: detailsData.result.formatted_phone_number || "No phone available",
              openingHours:
                detailsData.result.opening_hours?.weekday_text || ["No hours available"],
            };
          })
        );

        setStores(formattedStores);
      } else {
        console.error("Error fetching places:", data.status);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    }
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
          <Marker key={store.id} coordinate={store.coordinates}>
            <View style={{ alignItems: "center" }}>
              {/* Store Name Beside Marker */}
              {/* <View
                style={{
                  position: "absolute",
                  left: 35, // Adjust position beside the marker
                  backgroundColor: "white",
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                  borderRadius: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 5, // For Android shadow
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "bold", color: "black" }}>
                  {store.name}
                </Text>
              </View> */}

              {/* Custom Marker Icon */}
              <Image
                source={require("../../assets/images/store-icon.png")} // Replace with your marker icon
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>
          </Marker>
        ))}
      </MapView>


      {/* 🔵 FILTER BUTTON & PANEL */}
      <View style={styles.filterWrapper}>
        {filterVisible && (
          /* Animated Filter Panel */
          <Animated.View
            style={[
              styles.filterContainer,
              { 
                opacity: filterAnimation, 
                transform: [{ scaleY: filterAnimation }] // Animates height using scaling
              }
            ]}
          >
            {/* Star Rating Filter */}
            <View style={styles.ratingContainer}>
              <Text style={styles.label}>Stars:</Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRatingFilter(star)}>
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
                maximumValue={5000}
                step={500}
                value={distanceFilter}
                onValueChange={(value) => setDistanceFilter(value)}
                minimumTrackTintColor="#1E90FF"
                maximumTrackTintColor="#D3D3D3"
              />
              <Text style={styles.distanceText}>{distanceFilter / 1000} km</Text>
            </View>

            {/* Apply Search Button */}
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Filter Button */}
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilter}>
          <Image source={require("../../assets/images/filter-icon.png")} style={{ width: 24, height: 24, tintColor: "white" }} />
        </TouchableOpacity>
      </View>

      {/* Store List at the Bottom */}
      <View style={styles.storeList}>
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
                <Text style={styles.rating}>⭐ {item.rating}</Text>
                <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
                {item.phone && (
                  <Text style={styles.phone} numberOfLines={1}>📞 {item.phone}</Text>
                )}
              </View>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    ...StyleSheet.absoluteFillObject, // Makes the map full screen
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
    width: 280, // Adjust width
    height: 100, // Adjust height for consistency
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
  filterWrapper: {
    position: "absolute",
    bottom: '17.5%',
    right: '5%',
    alignItems: "flex-end",
  },
  // Filter Button
  filterButton: {
    position: "absolute",
    top: -45,
    right: '5%',
    backgroundColor: "#0B417D",
    padding: 10,
    borderRadius: 25,
    zIndex: 10,
  },

  // Filter Panel
  filterContainer: {
    width: 230,
    backgroundColor: "#0B417D",
    borderRadius: 10,
    padding: 10,
    position: "absolute",
    bottom: 50, // Expands UP above the button
    overflow: "hidden",
    zIndex: 10,
  },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  label: { color: "white", fontSize: 14, fontWeight: "bold", marginRight: 5 },
  star: { fontSize: 20, color: "white", marginRight: 18 },
  starSelected: { color: "gold" },
  sliderContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  distanceText: { color: "white", fontSize: 12, marginLeft: 5 },
  searchButton: { backgroundColor: "#4CAF50", padding: 8, borderRadius: 5, alignItems: "center", marginTop: 10 },
  searchButtonText: { color: "white", fontWeight: "bold" },
});

export default NearbyShops;