import React, { useRef, useState, useEffect } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Image,
  Linking,
} from "react-native";
import * as Location from "expo-location";

<<<<<<< HEAD
const GOOGLE_MAPS_API_KEY = "AlzaSyrYeoyenSoyRNqkQO5HrjXTpbgmBYNf2yY";
=======
const GOOGLE_MAPS_API_KEY = "AlzaSy1VIPkKSPBIhjOptL3b4xlFqI9ADUoRsNr";
>>>>>>> origin/Bazer

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
<<<<<<< HEAD
    console.log("Fetching URL:", url);

    try {
      const response = await fetch(url);
      console.log("Response: ", response);
      
      const data = await response.json();
      console.log("data: ", data);
=======

    try {
      const response = await fetch(url);
      const data = await response.json();
>>>>>>> origin/Bazer

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

  return (
    <View style={styles.container}>
      {/* Map View takes 2/3 of the screen */}
      <MapView
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
            title={store.name}
            onPress={() =>
              openGoogleMaps(store.coordinates.latitude, store.coordinates.longitude)
            }
          />
        ))}
      </MapView>

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
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.rating}>⭐ {item.rating}</Text>
                <Text style={styles.address} numberOfLines={1}>
                  {item.address}
                </Text>
                {item.phone && (
                  <Text style={styles.phone} numberOfLines={1}>
                    📞 {item.phone}
                  </Text>
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
    flex: 5, // Takes up 2/3 of the screen
  },
  storeList: {
    flex: 1, // Takes up 1/3 of the screen
    paddingVertical: 30,
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
});

export default NearbyShops;