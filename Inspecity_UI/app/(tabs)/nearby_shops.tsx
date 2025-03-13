import React, { useRef, useState, useEffect } from "react";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, Text, View, FlatList, Pressable, Image } from "react-native";
import * as Location from "expo-location";
import markers from "../../assets/markers";

const NearbyShops = () => {
  const mapRef = useRef<MapView>(null);
  const [selectedCard, setSelectedCard] = useState("");
  const [userLocation, setUserLocation] = useState<Region | null>(null);

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

      // Move map to user's location
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE} // <-- Use Google Maps provider
        style={styles.map}
        ref={mapRef}
        initialRegion={
          userLocation || { latitude: 37.7749, longitude: -122.4194, latitudeDelta: 0.05, longitudeDelta: 0.05 }
        }
        showsUserLocation={true} // Show user's current location
        showsMyLocationButton={true} // Show button to center map on user
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
        )}
        {markers.map((marker, index) => (
          <Marker key={index} title={marker.name} coordinate={marker.coordinates} />
        ))}
      </MapView>

      <View style={styles.markerListContainer}>
        <FlatList
          horizontal
          data={markers}
          keyExtractor={(item) => item.name}
          renderItem={({ item: marker }) => (
            <Pressable
              onPress={() => {
                setSelectedCard(marker.name);
                mapRef.current?.animateToRegion(marker.coordinates, 1000);
              }}
              style={
                marker.name === selectedCard
                  ? styles.activeMarkerButton
                  : styles.markerButton
              }
            >
              <Image source={{ uri: marker.image }} style={styles.markerImage} />
              <View style={styles.markerInfo}>
                <Text style={styles.markerName}>{marker.name}</Text>
                <Text style={styles.markerDescription}>{marker.description}</Text>
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
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  map: { flex: 1 },
  markerListContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  activeMarkerButton: {
    backgroundColor: "#E7E3AC",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 250,
  },
  markerButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 250,
  },
  markerImage: { width: 55, height: 55, borderRadius: 10, marginRight: 10 },
  markerInfo: { flex: 1 },
  markerName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  markerDescription: { fontSize: 12, color: "#666", marginTop: 5 },
});

export default NearbyShops;
