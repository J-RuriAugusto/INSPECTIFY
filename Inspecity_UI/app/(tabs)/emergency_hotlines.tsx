import React, { useState, useEffect, useCallback } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, Linking 
} from "react-native";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

const GOOGLE_API_KEY = "AlzaSysSIYHDroeAu3l1D7TZ2X3ZkJNiRQUsNBz"; // Replace with your actual Google API key

const emergencyKeywords = [
  "emergency rescue",
  "hospital",
  "fire station",
  "police station",
  "Red Cross",
  "volunteer fire brigade",
  "Cebu City Command Center",
];

const EmergencyHotlines = () => {
  const [hotlines, setHotlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the icon getter function
  const getIcon = useCallback((type) => {
    switch (type) {
      case "hospital":
        return <MaterialIcons name="local-hospital" size={24} color="red" />;
      case "fire station":
      case "volunteer fire brigade":
        return <MaterialIcons name="local-fire-department" size={24} color="orange" />;
      case "police station":
        return <MaterialIcons name="local-police" size={24} color="blue" />;
      case "Red Cross":
        return <MaterialIcons name="volunteer-activism" size={24} color="red" />;
      case "Cebu City Command Center":
        return <MaterialIcons name="support-agent" size={24} color="purple" />;
      default:
        return <MaterialIcons name="emergency" size={24} color="black" />;
    }
  }, []);

  // Memoize the place details fetcher
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

  // Optimized hotline fetcher with parallel requests
  const fetchHotlines = useCallback(async (loc) => {
    const { latitude, longitude } = loc.coords;
    setLoading(true);
    setError(null);

    try {
      // Process all keywords in parallel
      const keywordRequests = emergencyKeywords.map(async (keyword) => {
        try {
          const response = await fetch(
            `https://maps.gomaps.pro/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=10000&keyword=${encodeURIComponent(
              keyword
            )}&key=${GOOGLE_API_KEY}`
          );
          const data = await response.json();
          
          if (data.status !== "OK" || !data.results?.length) return [];

          // Process place details in parallel
          const placeDetails = await Promise.all(
            data.results.map(place => fetchPlaceDetails(place.place_id))
          );

          return data.results.map((place, index) => ({
            id: place.place_id,
            name: place.name,
            phone: placeDetails[index]?.formatted_phone_number || "N/A",
            address: place.vicinity || "No address available",
            type: keyword,
            icon: getIcon(keyword),
          }));
        } catch (err) {
          console.error(`Error fetching ${keyword}:`, err);
          return [];
        }
      });

      const results = await Promise.all(keywordRequests);
      const allHotlines = results.flat();

      // Remove duplicates efficiently
      const uniqueHotlines = allHotlines.reduce((acc, current) => {
        if (!acc.some(item => item.id === current.id)) {
          acc.push(current);
        }
        return acc;
      }, []);

      setHotlines(uniqueHotlines);
    } catch (error) {
      console.error("Error fetching hotlines:", error);
      setError("Failed to fetch emergency hotlines. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [fetchPlaceDetails, getIcon]);

  useEffect(() => {
    let isMounted = true;
    
    const getLocationAndHotlines = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Location permission denied");
        }

        const loc = await Location.getCurrentPositionAsync({});
        if (isMounted) {
          await fetchHotlines(loc);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message === "Location permission denied"
              ? "Location permission is required to get nearby hotlines."
              : "Failed to get your location. Please try again later."
          );
          setLoading(false);
        }
      }
    };

    getLocationAndHotlines();

    return () => {
      isMounted = false;
    };
  }, [fetchHotlines]);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#fff",
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() =>
        item.phone !== "N/A"
          ? Linking.openURL(`tel:${item.phone}`)
          : Alert.alert("No Phone Number Available", "Please visit the location for assistance.")
      }
    >
      {item.icon}
      <View style={{ marginLeft: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.name}</Text>
        <Text style={{ fontSize: 14, color: "gray" }}>{item.address}</Text>
        <Text style={{ fontSize: 16, color: "blue" }}>📞 {item.phone}</Text>
      </View>
    </TouchableOpacity>
  ), []);

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f8f9fa" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
        Emergency Hotlines
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#071C34" />
      ) : error ? (
        <Text style={{ textAlign: "center", fontSize: 16, color: "red" }}>{error}</Text>
      ) : hotlines.length > 0 ? (
        <FlatList
          data={hotlines}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={11}
        />
      ) : (
        <Text style={{ textAlign: "center", fontSize: 16, color: "gray" }}>
          No emergency hotlines found near you.
        </Text>
      )}
    </View>
  );
};

export default EmergencyHotlines;